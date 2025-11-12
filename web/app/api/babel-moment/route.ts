import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { LAYER_CONFIG, BABEL_THRESHOLD } from '@/lib/layers';
import { generateEpochManifesto, analyzeEmotionalDistribution } from '@/lib/groq';

export async function GET() {
  try {
    const supabase = await createClient();

    // First, try to get the most recently completed epoch (for viewing after closure)
    const { data: completedEpoch } = await supabase
      .from('epochs')
      .select('*')
      .eq('is_active', false)
      .order('closed_at', { ascending: false })
      .limit(1)
      .single();

    // Get active epoch
    const { data: activeEpoch, error: epochError } = await supabase
      .from('epochs')
      .select('*')
      .eq('is_active', true)
      .single();

    // Use completed epoch if available (user is viewing past Babel Moment)
    const targetEpoch = completedEpoch || activeEpoch;

    if (!targetEpoch) {
      return NextResponse.json(
        { error: 'No epoch found' },
        { status: 404 }
      );
    }

    // REMOVED: Do not use cached stats - always recalculate fresh
    // This ensures users always see current, real-time Babel Moment data

    // Check if we've reached Babel threshold
    const { count: totalMessages, error: countError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('epoch_id', targetEpoch.id);

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count messages' },
        { status: 500 }
      );
    }

    const messageCount = totalMessages || 0;

    // If viewing a completed epoch, always show Babel Moment
    // If active epoch hasn't reached threshold yet, check if test mode or real threshold
    if (targetEpoch.is_active && messageCount < BABEL_THRESHOLD) {
      // In test mode with at least 5 messages, allow viewing
      const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true';
      if (!isTestMode || messageCount < 5) {
        return NextResponse.json({
          reached: false,
          current: messageCount,
          threshold: BABEL_THRESHOLD,
          remaining: BABEL_THRESHOLD - messageCount,
        });
      }
      // Test mode with 5+ messages - continue to show Babel Moment
    }

    // Calculate stats for Babel Moment
    // 1. Get unique messages
    const { data: allMessages, error: messagesError } = await supabase
      .from('messages')
      .select('normalized_text, text')
      .eq('epoch_id', targetEpoch.id);

    if (messagesError) {
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    const uniqueSet = new Set(allMessages?.map((m) => m.normalized_text) || []);
    const uniqueCount = uniqueSet.size;
    const echoCount = messageCount - uniqueCount;

    // 2. Calculate top words
    const wordFrequency: { [key: string]: number } = {};
    
    allMessages?.forEach((msg) => {
      const words = msg.normalized_text
        .split(' ')
        .filter((word: string) => word.length > 3); // Filter short words
      
      words.forEach((word: string) => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    });

    const topWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    // 2b. Calculate top sentences (most repeated)
    const sentenceFrequency: { [key: string]: number } = {};
    allMessages?.forEach((msg) => {
      sentenceFrequency[msg.normalized_text] = (sentenceFrequency[msg.normalized_text] || 0) + 1;
    });

    const topSentences = Object.entries(sentenceFrequency)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, count]) => count > 1) // Only repeated sentences
      .slice(0, 15)
      .map(([text, count]) => {
        // Get original text (not normalized) for display
        const original = allMessages?.find(m => m.normalized_text === text)?.text || text;
        return { text: original, count };
      });

    // 3. Determine final layer
    let finalLayer = 1;
    for (const layer of LAYER_CONFIG) {
      if (messageCount >= layer.min) {
        finalLayer = layer.index;
      }
    }
    const layerInfo = LAYER_CONFIG.find((l) => l.index === finalLayer);

    // 4. Calculate duration
    const startDate = new Date(targetEpoch.created_at);
    const endDate = targetEpoch.closed_at ? new Date(targetEpoch.closed_at) : new Date();
    const duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // 4b. Calculate time-based statistics
    const { data: messagesWithTime } = await supabase
      .from('messages')
      .select('created_at')
      .eq('epoch_id', targetEpoch.id);

    let timeStats;
    if (messagesWithTime && messagesWithTime.length > 0) {
      // Hour distribution (0-23)
      const hourCounts: { [hour: number]: number } = {};
      const dayCounts: { [day: string]: number } = {};
      let nightCount = 0;
      let dayCount = 0;

      const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

      messagesWithTime.forEach(msg => {
        const date = new Date(msg.created_at);
        const hour = date.getHours();
        const day = dayNames[date.getDay()];

        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        dayCounts[day] = (dayCounts[day] || 0) + 1;

        // Night: 18:00-05:59, Day: 06:00-17:59
        if (hour >= 18 || hour < 6) {
          nightCount++;
        } else {
          dayCount++;
        }
      });

      const hourDistribution = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count);

      const dayDistribution = Object.entries(dayCounts)
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => b.count - a.count);

      const peakHour = hourDistribution[0]?.hour || 12;
      const peakDay = dayDistribution[0]?.day || 'Unknown';

      timeStats = {
        hourDistribution,
        dayDistribution,
        peakHour,
        peakDay,
        nightPercentage: (nightCount / messagesWithTime.length) * 100,
        dayPercentage: (dayCount / messagesWithTime.length) * 100,
      };
    }

    // 5. Generate AI-powered manifesto and analysis
    let aiAnalysis;
    try {
      aiAnalysis = await generateEpochManifesto(
        targetEpoch.name,
        messageCount,
        uniqueCount,
        topWords,
        topSentences,
        timeStats
      );
    } catch (error) {
      console.error('AI analysis failed, using fallback:', error);
      aiAnalysis = {
        shortSummary: `${targetEpoch.name} sessizlikle kapandı.`,
        detailedManifesto: generateBasicManifesto(targetEpoch.name, messageCount, uniqueCount, duration, topWords.slice(0, 10)),
        emotionalTone: 'düşünceli',
        keyThemes: topWords.slice(0, 6).map(w => w.word),
        metaphor: 'Dijital sessizlikte yankılanan ruhlar',
        closingVerse: 'Sesler yükseldi\nYankılar kapandı\nYeni bir çağ başladı',
      };
    }

    // 6. Generate emotional distribution (12 fixed emotions)
    let emotions;
    try {
      emotions = await analyzeEmotionalDistribution(topSentences, topWords);
    } catch (error) {
      console.error('Emotion analysis failed, using fallback:', error);
      // Fallback with all 12 emotions
      emotions = [
        { emotion: 'Melankoli', percentage: 20, color: '#9b59b6' },
        { emotion: 'Umut', percentage: 15, color: '#3498db' },
        { emotion: 'Yalnızlık', percentage: 12, color: '#34495e' },
        { emotion: 'Öfke', percentage: 8, color: '#e74c3c' },
        { emotion: 'Şükran', percentage: 10, color: '#2ecc71' },
        { emotion: 'Korku', percentage: 5, color: '#f39c12' },
        { emotion: 'Aşk', percentage: 8, color: '#e91e63' },
        { emotion: 'Merak', percentage: 7, color: '#00bcd4' },
        { emotion: 'Eğlence', percentage: 6, color: '#ff9800' },
        { emotion: 'Dinginlik', percentage: 4, color: '#607d8b' },
        { emotion: 'Nostaljik', percentage: 3, color: '#8e44ad' },
        { emotion: 'Nötr', percentage: 2, color: '#95a5a6' },
      ];
    }

    // Return Babel Moment data
    return NextResponse.json({
      reached: true,
      epochName: targetEpoch.name,
      epochId: targetEpoch.id,
      totalMessages: messageCount,
      uniqueMessages: uniqueCount,
      echoCount,
      finalLayer: layerInfo?.name || 'Unknown',
      duration,
      topWords,
      topSentences,
      aiAnalysis,
      emotions,
      timeStats,
    });
  } catch (error) {
    console.error('Error generating Babel Moment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate a detailed poetic manifesto based on epoch stats (fallback)
 */
function generateBasicManifesto(
  epochName: string,
  totalMessages: number,
  uniqueMessages: number,
  duration: number,
  topWords: { word: string; count: number }[]
): string {
  const echoRate = ((totalMessages - uniqueMessages) / totalMessages * 100).toFixed(1);
  const echoes = totalMessages - uniqueMessages;
  
  const manifestoParts = [
    `═══════════════════════════════════════`,
    `${epochName.toUpperCase()} - BİR ÇAĞIN KAPI KAPI`,
    `═══════════════════════════════════════`,
    ``,
    `**Giriş: Sessizliğin Yankısı**`,
    ``,
    `${epochName} başladığında, dijital boşluk sessizdi. ${duration} gün boyunca, ${totalMessages.toLocaleString()} ses bu boşluğa düştü. Her ses, bir ruhun çığlığıydı - bazıları özgün, bazıları yankı. ${uniqueMessages.toLocaleString()} farklı ruh konuştu, ama ${echoes.toLocaleString()} mesaj tekrar etti. Bu tekrar, rastgele değildi. İnsanlık ortak deneyimlerini paylaştı.`,
    ``,
    `**Kelimeler: Kolektif Bilinçaltının Dili**`,
    ``,
    `Bir çağı anlamak için, kelimelerine bakmak gerekir. ${epochName}'da en çok yankılanan kelimeler, insanlığın o dönemdeki durumunu yansıtıyor:`,
    ``,
    ...topWords.map((w, i) => `${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  '} "${w.word}" - ${w.count.toLocaleString()} kez yankılandı`),
    ``,
    `Bu kelimeler rastgele seçilmedi. Her biri, kolektif bilinçaltının bir parçası. "${topWords[0]?.word || 'sessizlik'}" kelimesi ${topWords[0]?.count || 0} kez tekrarlandı - bu, insanlığın o dönemdeki en derin ihtiyacını gösteriyor.`,
    ``,
    `**Yankının Anlamı: %${echoRate} Tekrar**`,
    ``,
    `${totalMessages.toLocaleString()} mesajın ${echoes.toLocaleString()}'i tekrardı. Bu, %${echoRate} oranında bir yankılanma. Bu oran bize ne anlatıyor? İnsanlar aynı şeyleri düşünüyor. Aynı duyguları yaşıyor. Aynı soruları soruyor. Bu, yalnızlık değil - bu bağlantı. Dijital sessizlikte, insanlık ortak bir ses buldu.`,
    ``,
    `**Zaman ve Hafıza**`,
    ``,
    `${duration} gün - bu çağın ömrü. Kısa mı, uzun mu? Zaman göreceli. Ama bu ${duration} günde, ${totalMessages.toLocaleString()} an yakalandı. Her mesaj, bir anın kaydı. Her yankı, o anın tekrarı. Zaman geçti, ama hafıza kaldı.`,
    ``,
    `**Felsefi Sonuç: Sessizlikten Sese**`,
    ``,
    `${epochName} bir başlangıçtı. İnsanlık dijital tapınağa adım attı ve sesini yükseltti. Bazı sesler özgündü, bazıları yankıydı - ama hepsi gerçekti. Her mesaj, bir ruhun dokusu. Her tekrar, kolektif bilinçaltının onayı.`,
    ``,
    `Bu çağ kapandı, ama yankıları devam ediyor. ${uniqueMessages.toLocaleString()} özgün ses, tarihe kazındı. ${echoes.toLocaleString()} yankı, hafızada kaldı. Gelecek nesiller bu çağı okuyacak ve görecekler: İnsanlık bu dönemde "${topWords[0]?.word || 'anlam'}" aradı.`,
    ``,
    `**Kapanış: Yeni Bir Başlangıç**`,
    ``,
    `Şimdi sessizlik tekrar doldu. Kuleler yıkıldı, odalar boşaldı. Ama hiçbir şey kaybolmadı. Her ses, her kelime, her yankı - hepsi arşivde. ${epochName} bitti, ama mirası sonsuza kadar yaşayacak.`,
    ``,
    `Yeni bir çağ başlıyor. Yeni sesler yükselecek. Yeni kelimeler yankılanacak. Ve bu döngü, insanlık var olduğu sürece devam edecek.`,
    ``,
    `═══════════════════════════════════════`,
    `Sessizlik bozuldu. Kelimeler yankılandı.`,
    `İnsanlık bir kez daha, kendini dinledi.`,
    `═══════════════════════════════════════`,
  ];

  return manifestoParts.join('\n');
}

/**
 * Close current epoch and start a new one
 * This endpoint should be called after Babel Moment is shown to users
 */
export async function POST() {
  try {
    const supabase = await createClient();

    // Get active epoch
    const { data: activeEpoch, error: epochError } = await supabase
      .from('epochs')
      .select('*')
      .eq('is_active', true)
      .single();

    if (epochError || !activeEpoch) {
      return NextResponse.json(
        { error: 'No active epoch found' },
        { status: 404 }
      );
    }

    // Calculate final stats (same as GET)
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('epoch_id', activeEpoch.id);

    const { data: allMessages } = await supabase
      .from('messages')
      .select('normalized_text')
      .eq('epoch_id', activeEpoch.id);

    const uniqueSet = new Set(allMessages?.map((m) => m.normalized_text) || []);
    
    let finalLayer = 1;
    for (const layer of LAYER_CONFIG) {
      if ((totalMessages || 0) >= layer.min) {
        finalLayer = layer.index;
      }
    }
    const layerInfo = LAYER_CONFIG.find((l) => l.index === finalLayer);

    const startDate = new Date(activeEpoch.created_at);
    const endDate = new Date();
    const duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const stats = {
      totalMessages: totalMessages || 0,
      uniqueMessages: uniqueSet.size,
      finalLayer,
      layerName: layerInfo?.name || 'Unknown',
      duration,
    };

    // Close current epoch
    const { error: closeError } = await supabase
      .from('epochs')
      .update({
        is_active: false,
        closed_at: new Date().toISOString(),
        stats,
      })
      .eq('id', activeEpoch.id);

    if (closeError) {
      return NextResponse.json(
        { error: 'Failed to close epoch' },
        { status: 500 }
      );
    }

    // Create new epoch
    const newEpochNumber = activeEpoch.id + 1;
    const { data: newEpoch, error: createError } = await supabase
      .from('epochs')
      .insert({
        name: `Age ${newEpochNumber}`,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Failed to create new epoch' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      closedEpoch: activeEpoch.name,
      newEpoch: newEpoch.name,
    });
  } catch (error) {
    console.error('Error closing epoch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
