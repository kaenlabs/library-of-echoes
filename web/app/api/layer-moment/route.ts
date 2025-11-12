import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { LAYER_CONFIG } from '@/lib/layers';
import { generateLayerMoment, analyzeLayerEmotions } from '@/lib/groq-layer';

/**
 * Layer Moment - Mini Babel for each layer transition
 * Triggered automatically when reaching new layer threshold
 * Fully AI-generated, instant
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get active epoch
    const { data: activeEpoch } = await supabase
      .from('epochs')
      .select('*')
      .eq('is_active', true)
      .single();

    if (!activeEpoch) {
      return NextResponse.json({ error: 'No active epoch' }, { status: 404 });
    }

    // Get message count
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('epoch_id', activeEpoch.id);

    const messageCount = totalMessages || 0;

    // Determine current layer
    let currentLayer = 1;
    for (const layer of LAYER_CONFIG) {
      if (messageCount >= layer.min) {
        currentLayer = layer.index;
      }
    }
    const layerInfo = LAYER_CONFIG.find((l) => l.index === currentLayer);

    if (!layerInfo) {
      return NextResponse.json({ error: 'Invalid layer' }, { status: 400 });
    }

    // Get all messages for analysis
    const { data: allMessages } = await supabase
      .from('messages')
      .select('normalized_text, text')
      .eq('epoch_id', activeEpoch.id);

    const uniqueSet = new Set(allMessages?.map((m) => m.normalized_text) || []);
    const uniqueCount = uniqueSet.size;
    const echoCount = messageCount - uniqueCount;

    // Turkish stop words (same as epoch-export)
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

    // Calculate top words - with filtering for Layer 2+
    const wordFrequency: { [key: string]: number } = {};
    allMessages?.forEach((msg) => {
      const words = msg.normalized_text
        .split(' ')
        .filter((word: string) => 
          word.length > 3 && // At least 4 characters
          (currentLayer === 1 || !stopWords.has(word.toLowerCase())) && // Stop words only for Layer 2+
          !/^\d+$/.test(word) // Not just numbers
        );
      words.forEach((word: string) => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    });

    // Minimum frequency: Layer 1 = 1+, Layer 2+ = 2+
    const minFrequency = currentLayer === 1 ? 1 : 2;
    const topWords = Object.entries(wordFrequency)
      .filter(([_, count]) => count >= minFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, count]) => ({ word, count }));

    // Calculate top sentences
    const sentenceFrequency: { [key: string]: number } = {};
    allMessages?.forEach((msg) => {
      sentenceFrequency[msg.normalized_text] = (sentenceFrequency[msg.normalized_text] || 0) + 1;
    });

    const topSentences = Object.entries(sentenceFrequency)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, count]) => count > 1)
      .slice(0, 10)
      .map(([text, count]) => {
        const original = allMessages?.find(m => m.normalized_text === text)?.text || text;
        return { text: original, count };
      });

    // COMPARISON SYSTEM: Compare with previous layers
    const layerComparisons = [];
    
    if (currentLayer > 1) {
      // Compare with each previous layer
      for (let prevLayerIndex = currentLayer - 1; prevLayerIndex >= 1; prevLayerIndex--) {
        const prevLayerConfig = LAYER_CONFIG.find(l => l.index === prevLayerIndex);
        if (!prevLayerConfig) continue;

        // Get messages up to previous layer's max threshold
        const prevLayerMax = prevLayerIndex < LAYER_CONFIG.length 
          ? LAYER_CONFIG[prevLayerIndex].min 
          : messageCount;
        
        const messagesUpToPrevLayer = allMessages?.slice(0, prevLayerMax) || [];
        
        // Calculate previous layer stats
        const prevUniqueSet = new Set(messagesUpToPrevLayer.map(m => m.normalized_text));
        const prevUniqueCount = prevUniqueSet.size;
        
        // Previous layer top words
        const prevWordFreq: { [key: string]: number } = {};
        messagesUpToPrevLayer.forEach((msg) => {
          const words = msg.normalized_text
            .split(' ')
            .filter((word: string) => 
              word.length > 3 && 
              (prevLayerIndex === 1 || !stopWords.has(word.toLowerCase())) &&
              !/^\d+$/.test(word)
            );
          words.forEach((word: string) => {
            prevWordFreq[word] = (prevWordFreq[word] || 0) + 1;
          });
        });

        const prevTopWords = Object.entries(prevWordFreq)
          .filter(([_, count]) => count >= (prevLayerIndex === 1 ? 1 : 2))
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([word]) => word);

        // Calculate differences
        const newWords = topWords.slice(0, 5)
          .map(w => w.word)
          .filter(word => !prevTopWords.includes(word));
        
        const messageDiff = messageCount - prevLayerMax;
        const uniqueDiff = uniqueCount - prevUniqueCount;
        const echoDiff = echoCount - (prevLayerMax - prevUniqueCount);

        layerComparisons.push({
          comparedWith: `Katman ${prevLayerIndex}`,
          layerName: prevLayerConfig.name,
          messageGrowth: messageDiff,
          uniqueGrowth: uniqueDiff,
          echoGrowth: echoDiff,
          newTopWords: newWords,
        });
      }
    }

    // Generate AI analysis (optimized for layers)
    let aiAnalysis;
    try {
      aiAnalysis = await generateLayerMoment(
        activeEpoch.name,
        layerInfo.name,
        currentLayer,
        messageCount,
        uniqueCount,
        topWords,
        topSentences
      );
    } catch (error) {
      console.error('Layer Moment AI failed:', error);
      aiAnalysis = {
        shortSummary: `${layerInfo.name} katmanına ulaştınız!`,
        detailedManifesto: `${messageCount} mesaj ile ${layerInfo.name} katmanına geçildi. Kolektif bilinç genişliyor...`,
        emotionalTone: 'dinamik',
        keyThemes: topWords.slice(0, 5).map(w => w.word),
      };
    }

    // Generate emotions (lighter version for layers)
    let emotions;
    try {
      emotions = await analyzeLayerEmotions(topSentences, topWords, currentLayer);
    } catch (error) {
      emotions = [
        { emotion: 'Merak', percentage: 40, color: '#00bcd4' },
        { emotion: 'Umut', percentage: 30, color: '#3498db' },
        { emotion: 'Nötr', percentage: 30, color: '#95a5a6' },
      ];
    }

    // Save layer transition to epoch stats (for history)
    try {
      const layerTransition = {
        layerIndex: currentLayer,
        layerName: layerInfo.name,
        reachedAt: new Date().toISOString(),
        messageCount,
        uniqueMessages: uniqueCount,
        echoCount,
        topWords: topWords.slice(0, 10),
        emotions,
        aiSummary: aiAnalysis?.shortSummary || '',
        comparisons: layerComparisons,
      };

      // Get current stats
      const currentStats = activeEpoch.stats || {};
      const existingTransitions = currentStats.layerTransitions || [];

      // Check if this layer already exists (avoid duplicates)
      const layerExists = existingTransitions.some(
        (t: any) => t.layerIndex === currentLayer
      );

      if (!layerExists) {
        // Add new transition
        const updatedStats = {
          ...currentStats,
          layerTransitions: [...existingTransitions, layerTransition],
        };

        // Update epoch stats
        await supabase
          .from('epochs')
          .update({ stats: updatedStats })
          .eq('id', activeEpoch.id);

        console.log(`✅ Saved layer ${currentLayer} transition for epoch ${activeEpoch.id}`);
      }
    } catch (error) {
      console.error('Failed to save layer transition:', error);
      // Non-critical error, continue
    }

    return NextResponse.json({
      layerName: layerInfo.name,
      layerIndex: currentLayer,
      totalMessages: messageCount,
      uniqueMessages: uniqueCount,
      echoCount,
      topWords,
      topSentences: topSentences.slice(0, 5),
      aiAnalysis,
      emotions,
      theme: layerInfo.theme,
      comparisons: layerComparisons, // NEW: Previous layer comparisons
    });
  } catch (error) {
    console.error('Layer Moment error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
