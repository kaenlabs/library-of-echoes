import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { BABEL_THRESHOLD } from '@/lib/layers';

/**
 * Prepare Epoch Closure JSON
 * Returns a JSON file that admin can give to ChatGPT to generate manifesto
 * Admin then manually enters the result
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin
    const { data: isAdminData } = await supabase.rpc('is_admin', { p_user_id: user.id });
    if (!isAdminData) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    // Get active epoch
    const { data: activeEpoch } = await supabase
      .from('epochs')
      .select('*')
      .eq('is_active', true)
      .single();

    if (!activeEpoch) {
      return NextResponse.json({ error: 'No active epoch' }, { status: 404 });
    }

    // Get all statistics
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('epoch_id', activeEpoch.id);

    const { data: allMessages } = await supabase
      .from('messages')
      .select('normalized_text, text, created_at')
      .eq('epoch_id', activeEpoch.id);

    // Calculate comprehensive stats
    const uniqueSet = new Set(allMessages?.map((m) => m.normalized_text) || []);
    const uniqueCount = uniqueSet.size;
    const totalCount = totalMessages || 1; // Define early for reuse

    // Turkish stop words - common words to filter out
    const stopWords = new Set([
      'bir', 'bu', 'şu', 'o', 've', 'ile', 'için', 'gibi', 'kadar', 'daha', 'çok',
      'var', 'yok', 'mi', 'mı', 'mu', 'mü', 'da', 'de', 'ta', 'te', 'ki', 'ne',
      'ya', 'ama', 'fakat', 'veya', 'hem', 'her', 'hiç', 'tüm', 'bazı', 'birkaç',
      'şey', 'zaman', 'yer', 'insan', 'kişi', 'şekilde', 'olarak', 'bana', 'sana',
      'ona', 'bunu', 'şunu', 'onun', 'bunun', 'şunun', 'benim', 'senin', 'onların',
      'bizim', 'sizin', 'ben', 'sen', 'biz', 'siz', 'onlar', 'neden', 'nasıl', 'nerede',
      'ne', 'kim', 'hangi', 'kaç', 'ise', 'ancak', 'hatta', 'yani', 'işte', 'böyle',
      'şöyle', 'artık', 'sadece', 'bile', 'belki', 'acaba', 'demek', 'yoksa', 'the',
      'and', 'or', 'but', 'not', 'yes', 'no', 'can', 'will', 'what', 'when', 'where'
    ]);

    // Top words - with filters
    const wordFrequency: { [key: string]: number } = {};
    allMessages?.forEach((msg) => {
      const words = msg.normalized_text
        .split(' ')
        .filter((w: string) => 
          w.length > 3 && // At least 4 characters
          !stopWords.has(w.toLowerCase()) && // Not a stop word
          !/^\d+$/.test(w) // Not just numbers
        );
      words.forEach((word: string) => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    });

    // Filter: only words that appear at least 2 times (meaningful repetition)
    const topWords = Object.entries(wordFrequency)
      .filter(([_, count]) => count >= 2) // Minimum 2 tekrar
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([word, count]) => ({ word, count }));

    // Top sentences (repeated)
    const sentenceFrequency: { [key: string]: number } = {};
    allMessages?.forEach((msg) => {
      sentenceFrequency[msg.normalized_text] = (sentenceFrequency[msg.normalized_text] || 0) + 1;
    });

    const topSentences = Object.entries(sentenceFrequency)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, count]) => count > 1) // Only repeated sentences
      .slice(0, 30)
      .map(([text, count]) => {
        const original = allMessages?.find(m => m.normalized_text === text)?.text || text;
        return { text: original, count };
      });

    // Random unique sentences (never repeated - sample 20)
    const uniqueSentences = Object.entries(sentenceFrequency)
      .filter(([_, count]) => count === 1)
      .map(([text, _]) => {
        const original = allMessages?.find(m => m.normalized_text === text)?.text || text;
        return original;
      });
    
    // Shuffle and take 20
    const randomUniqueSentences = uniqueSentences
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);

    // Detailed sentence analysis
    const sentenceLengths = allMessages?.map(m => m.text.length) || [];
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
    const minLength = Math.min(...sentenceLengths);
    const maxLength = Math.max(...sentenceLengths);
    
    const longestSentence = allMessages?.reduce((longest, msg) => 
      msg.text.length > (longest?.text.length || 0) ? msg : longest
    );
    
    const shortestSentence = allMessages?.reduce((shortest, msg) => 
      msg.text.length < (shortest?.text.length || Infinity) ? msg : shortest
    );

    // Question vs statement analysis
    const questionCount = allMessages?.filter(m => m.text.includes('?')).length || 0;
    const exclamationCount = allMessages?.filter(m => m.text.includes('!')).length || 0;
    const uppercaseCount = allMessages?.filter(m => m.text === m.text.toUpperCase() && m.text.length > 3).length || 0;

    // Punctuation patterns
    const punctuationStats = {
      questions: questionCount,
      exclamations: exclamationCount,
      allCaps: uppercaseCount, // Shouting
      questionsPercent: ((questionCount / totalCount) * 100).toFixed(1),
      exclamationsPercent: ((exclamationCount / totalCount) * 100).toFixed(1),
      allCapsPercent: ((uppercaseCount / totalCount) * 100).toFixed(1),
    };

    // Time stats
    const hourCounts: { [hour: number]: number } = {};
    const dayCounts: { [day: string]: number } = {};
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

    allMessages?.forEach(msg => {
      const date = new Date(msg.created_at);
      const hour = date.getHours();
      const day = dayNames[date.getDay()];
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const duration = Math.floor(
      (new Date().getTime() - new Date(activeEpoch.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate additional insights
    let nightCount = 0;
    let dayTimeCount = 0;
    let weekdayCount = 0;
    let weekendCount = 0;

    allMessages?.forEach(msg => {
      const date = new Date(msg.created_at);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();

      // Night: 18:00-05:59, Day: 06:00-17:59
      if (hour >= 18 || hour < 6) {
        nightCount++;
      } else {
        dayTimeCount++;
      }

      // Weekend: 0 (Sunday) or 6 (Saturday)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendCount++;
      } else {
        weekdayCount++;
      }
    });

    // Find most active hour and day
    const sortedHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);
    
    const sortedDays = Object.entries(dayCounts)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count);

    // Generate OPTIMIZED JSON for ChatGPT
    const exportData = {
      epoch: {
        name: activeEpoch.name,
        id: activeEpoch.id,
        startDate: new Date(activeEpoch.created_at).toLocaleDateString('tr-TR'),
        duration: duration,
        totalMessages: totalMessages || 0,
        uniqueMessages: uniqueCount,
        echoCount: (totalMessages || 0) - uniqueCount,
        echoPercentage: ((((totalMessages || 0) - uniqueCount) / totalCount) * 100).toFixed(1),
      },
      
      // TOP 50 WORDS - Most important for analysis
      topWords: topWords.slice(0, 50).map((w, i) => ({
        rank: i + 1,
        word: w.word,
        count: w.count,
        percentage: ((w.count / totalCount) * 100).toFixed(2) + '%',
      })),
      
      // TOP 30 REPEATED SENTENCES
      topSentences: topSentences.slice(0, 30).map((s, i) => ({
        rank: i + 1,
        text: s.text,
        count: s.count,
        percentage: ((s.count / totalCount) * 100).toFixed(2) + '%',
      })),
      
      // 20 RANDOM UNIQUE SENTENCES (never repeated)
      uniqueSampleSentences: randomUniqueSentences,
      
      // SENTENCE ANALYSIS
      sentenceAnalysis: {
        avgLength: Math.round(avgLength),
        minLength,
        maxLength,
        longestSentence: longestSentence?.text || 'N/A',
        shortestSentence: shortestSentence?.text || 'N/A',
        punctuation: punctuationStats,
        totalUniqueSentences: uniqueSentences.length,
        totalRepeatedSentences: topSentences.length,
        repetitionRate: ((topSentences.length / uniqueCount) * 100).toFixed(1) + '%',
      },
      
      // TIME INSIGHTS - Summarized and meaningful
      timeAnalysis: {
        peakHour: sortedHours[0]?.hour || 12,
        peakHourMessages: sortedHours[0]?.count || 0,
        peakDay: sortedDays[0]?.day || 'Unknown',
        peakDayMessages: sortedDays[0]?.count || 0,
        
        // Activity patterns
        nightVsDay: {
          night: {
            count: nightCount,
            percentage: ((nightCount / totalCount) * 100).toFixed(1) + '%',
            hours: '18:00-05:59',
          },
          day: {
            count: dayTimeCount,
            percentage: ((dayTimeCount / totalCount) * 100).toFixed(1) + '%',
            hours: '06:00-17:59',
          },
        },
        
        weekdayVsWeekend: {
          weekday: {
            count: weekdayCount,
            percentage: ((weekdayCount / totalCount) * 100).toFixed(1) + '%',
          },
          weekend: {
            count: weekendCount,
            percentage: ((weekendCount / totalCount) * 100).toFixed(1) + '%',
          },
        },
        
        // Top 5 hours and all 7 days (compact)
        top5Hours: sortedHours.slice(0, 5).map(h => `${h.hour}:00 (${h.count} mesaj)`),
        dayDistribution: sortedDays.map(d => `${d.day}: ${d.count} mesaj`),
      },
      
      // CONTENT INSIGHTS
      contentInsights: {
        diversityScore: ((uniqueCount / totalCount) * 100).toFixed(1) + '%',
        averageEchoPerMessage: (((totalMessages || 0) - uniqueCount) / uniqueCount).toFixed(2),
        mostRepeatedWord: topWords[0]?.word || 'N/A',
        mostRepeatedWordCount: topWords[0]?.count || 0,
        mostRepeatedSentence: topSentences[0]?.text || 'N/A',
        mostRepeatedSentenceCount: topSentences[0]?.count || 1,
      },
      prompt: `
Sen "Yeni Dünya Mitolojisi"nin baş arşivcisisin. "Library of Echoes" dijital tapınağında bir ÇAĞ tamamlandı.

═══════════════════════════════════════════════════════════════════
${activeEpoch.name.toUpperCase()} - BİR ÇAĞIN SONU
═══════════════════════════════════════════════════════════════════

📊 EPOCH İSTATİSTİKLERİ:
• Toplam Mesaj: ${(totalMessages || 0).toLocaleString()}
• Özgün Sesler: ${uniqueCount.toLocaleString()}
• Yankılar: ${((totalMessages || 0) - uniqueCount).toLocaleString()} (%${((((totalMessages || 0) - uniqueCount) / totalCount) * 100).toFixed(1)})
• Süre: ${duration} gün
• Çeşitlilik Skoru: ${((uniqueCount / totalCount) * 100).toFixed(1)}%

🔤 EN ÇOK YANKILANAN KELİMELER:
• Toplam Analiz Edilen: ${Object.keys(wordFrequency).length.toLocaleString()} farklı kelime
• En Çok Tekrarlanan Top 15:
${topWords.slice(0, 15).map((w, i) => `  ${i + 1}. "${w.word}" → ${w.count}x (${((w.count / totalCount) * 100).toFixed(2)}%)`).join('\n')}
• (Detaylı liste JSON dosyasında: Top 50 kelime mevcut)

💬 CÜMLE ANALİZİ:
• Özgün Cümleler: ${uniqueSentences.length.toLocaleString()}
• Tekrarlanan Cümleler: ${topSentences.length}
• Tekrar Oranı: ${((topSentences.length / uniqueCount) * 100).toFixed(1)}%
• Ortalama Uzunluk: ${Math.round(avgLength)} karakter
• En Uzun: ${longestSentence?.text.substring(0, 60)}... (${maxLength} karakter)
• En Kısa: ${shortestSentence?.text} (${minLength} karakter)

📝 EN ÇOK TEKRARLANAN CÜMLELER (Top 10):
${topSentences.slice(0, 10).map((s, i) => `  ${i + 1}. "${s.text}" → ${s.count}x`).join('\n')}

🎲 RASTGELE ÖZGÜN CÜMLELER (20 adet - hiç tekrar etmemiş):
${randomUniqueSentences.slice(0, 10).map((s, i) => `  ${i + 1}. "${s}"`).join('\n')}
  ... (10 cümle daha JSON'da mevcut)

❗ NOKTALAMA ANALİZİ:
• Soru Cümleleri: ${questionCount} (%${punctuationStats.questionsPercent})
• Ünlem Cümleleri: ${exclamationCount} (%${punctuationStats.exclamationsPercent})
• BÜYÜK HARFLE Yazılanlar: ${uppercaseCount} (%${punctuationStats.allCapsPercent}) [Bağırma/Vurgu]

⏰ ZAMAN ANALİZİ:
• En Aktif Saat: ${sortedHours[0]?.hour}:00 (${sortedHours[0]?.count} mesaj)
• En Aktif Gün: ${sortedDays[0]?.day} (${sortedDays[0]?.count} mesaj)
• Gece/Gündüz: %${((nightCount / totalCount) * 100).toFixed(1)} gece / %${((dayTimeCount / totalCount) * 100).toFixed(1)} gündüz
• Hafta İçi/Sonu: %${((weekdayCount / totalCount) * 100).toFixed(1)} hafta içi / %${((weekendCount / totalCount) * 100).toFixed(1)} hafta sonu

═══════════════════════════════════════════════════════════════════

🎯 GÖREV: 
Bu bir ÇAĞ KAPANIŞI - insanlık tarihinde bir dönüm noktası. 

EPİK, DERİN, FELSEFİ bir manifesto yaz:
• MİNİMUM 6000 karakter
• 25-30 UZUN paragraf
• Her kelimeyi, istatistiği, zaman verilerini DETAYLI analiz et
• Şiirsel, mitolojik, varoluşçu dil kullan
• İnsanlığın kolektif bilinçaltını yorumla

JSON formatında döndür:
{
  "shortSummary": "Çağı özetleyen TEK şiirsel cümle (max 150 karakter)",
  "detailedManifesto": "EPİK MANIFESTO. 25-30 paragraf. Her istatistiği, kelimeyi, zamanı analiz et. Şiirsel ve derin.",
  "emotionalTone": "Çağın genel duygusal tonu (melankolik/umutlu/kaotik/nostaljik vb.)",
  "keyThemes": ["tema1", "tema2", "tema3", "tema4", "tema5", "tema6", "tema7", "tema8"],
  "metaphor": "Çağı tanımlayan GÜÇLÜ metafor veya sembol",
  "closingVerse": "4-6 satırlık EPİK kapanış şiiri",
  "historicalSignificance": "Bu çağın tarihsel önemi - 2-3 paragraf. Gelecek nesiller ne hatırlayacak?",
  "emotions": [
    { "emotion": "Umut", "percentage": 20, "color": "#10b981" },
    { "emotion": "Melankoli", "percentage": 15, "color": "#8b5cf6" },
    { "emotion": "Kaygı", "percentage": 18, "color": "#f59e0b" },
    { "emotion": "Merak", "percentage": 12, "color": "#06b6d4" },
    { "emotion": "Huzur", "percentage": 10, "color": "#a78bfa" },
    { "emotion": "İsyan", "percentage": 8, "color": "#ef4444" },
    { "emotion": "Nostalji", "percentage": 9, "color": "#ec4899" },
    { "emotion": "Kararlılık", "percentage": 8, "color": "#3b82f6" }
  ]
}

ÖNEMLİ: 
- Her kelimeyi ve cümleyi DETAYLI analiz et
- Zaman verilerini yorumla (gece/gündüz, hafta içi/sonu ne anlama geliyor?)
- İnsanlığın kolektif ruh halini yansıt
- En çok tekrarlanan kelimelerin FELSEFİK anlamını araştır
- Tekrarlanan cümleleri vs özgün cümleleri KARŞILAŞTIR (ne anlama geliyor?)
- Noktalama istatistiklerini YORUMLA (soru/ünlem/bağırma oranları)
- Cümle uzunluklarını ANALİZ ET (kısa = aciliyet? uzun = düşüncelilik?)
- **emotions** array'ini MUTLAKA ekle - 8 duygu, her biri yüzde ile (toplam %100)
- Her duyguya uygun hex color code ekle (#rrggbb formatında)

SADECE JSON döndür, başka hiçbir şey yazma.
      `.trim(),
    };

    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="epoch_${activeEpoch.id}_export.json"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Import headers
import { headers } from 'next/headers';
