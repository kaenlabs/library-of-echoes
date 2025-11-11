/**
 * Epoch Manager
 * Handles epoch lifecycle, Babel Moment, and epoch transitions
 */

import { BABEL_THRESHOLD } from './layerManager';

export interface EpochStats {
  totalMessages: number;
  uniqueMessages: number;
  topWords: string[];
  emotions: {
    melancholy: number;
    neutral: number;
    hope: number;
    nihilism: number;
    joy: number;
  };
  manifesto: string;
  layerDistribution: { [key: number]: number };
}

/**
 * Closes the current epoch and generates statistics
 * Called when Babel Moment threshold is reached
 */
export async function closeEpoch(
  supabaseClient: any,
  epochId: number
): Promise<EpochStats> {
  // Get all messages for this epoch
  const { data: messages, error } = await supabaseClient
    .from('messages')
    .select('text, normalized_text, layer_index')
    .eq('epoch_id', epochId);

  if (error) {
    throw new Error(`Failed to fetch epoch messages: ${error.message}`);
  }

  // Calculate statistics
  const stats = await generateEpochStats(messages);

  // Update epoch in database
  await supabaseClient
    .from('epochs')
    .update({
      is_active: false,
      closed_at: new Date().toISOString(),
      stats: stats,
    })
    .eq('id', epochId);

  return stats;
}

/**
 * Creates a new epoch
 */
export async function createNewEpoch(
  supabaseClient: any,
  epochNumber: number
): Promise<number> {
  const { data, error } = await supabaseClient
    .from('epochs')
    .insert({
      name: `Age ${epochNumber}`,
      is_active: true,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create new epoch: ${error.message}`);
  }

  // Initialize layers for new epoch
  await initializeLayersForEpoch(supabaseClient, data.id);

  return data.id;
}

/**
 * Initializes layer definitions for a new epoch
 */
async function initializeLayersForEpoch(
  supabaseClient: any,
  epochId: number
): Promise<void> {
  const layers = [
    { layer_index: 1, min_messages: 0, max_messages: 100, theme_name: 'Void', css_class: 'layer-1' },
    { layer_index: 2, min_messages: 100, max_messages: 500, theme_name: 'Whisper', css_class: 'layer-2' },
    { layer_index: 3, min_messages: 500, max_messages: 1000, theme_name: 'Glitch', css_class: 'layer-3' },
    { layer_index: 4, min_messages: 1000, max_messages: 2000, theme_name: 'Wave', css_class: 'layer-4' },
    { layer_index: 5, min_messages: 2000, max_messages: 4000, theme_name: 'Neon', css_class: 'layer-5' },
    { layer_index: 6, min_messages: 4000, max_messages: 8000, theme_name: 'Ambient', css_class: 'layer-6' },
    { layer_index: 7, min_messages: 8000, max_messages: 50000, theme_name: 'Chaos', css_class: 'layer-7' },
    { layer_index: 8, min_messages: 50000, max_messages: 100000, theme_name: 'Burst', css_class: 'layer-8' },
    { layer_index: 9, min_messages: 100000, max_messages: 999999999, theme_name: 'Babel', css_class: 'layer-9' },
  ];

  const layersWithEpochId = layers.map(layer => ({
    epoch_id: epochId,
    ...layer,
  }));

  await supabaseClient.from('layers').insert(layersWithEpochId);
}

/**
 * Generates comprehensive statistics for an epoch
 */
export async function generateEpochStats(messages: any[]): Promise<EpochStats> {
  // Total messages
  const totalMessages = messages.length;

  // Unique messages
  const uniqueNormalized = new Set(messages.map(m => m.normalized_text));
  const uniqueMessages = uniqueNormalized.size;

  // Top words
  const topWords = extractTopWords(messages.map(m => m.text));

  // Layer distribution
  const layerDistribution: { [key: number]: number } = {};
  messages.forEach(m => {
    layerDistribution[m.layer_index] = (layerDistribution[m.layer_index] || 0) + 1;
  });

  // Emotions (simplified for MVP - can be enhanced with AI)
  const emotions = analyzeEmotions(messages.map(m => m.text));

  // Manifesto (simplified for MVP - can be enhanced with AI)
  const manifesto = generateManifesto(topWords, emotions, totalMessages);

  return {
    totalMessages,
    uniqueMessages,
    topWords,
    emotions,
    manifesto,
    layerDistribution,
  };
}

/**
 * Extracts top N most common words from messages
 */
function extractTopWords(texts: string[], topN: number = 10): string[] {
  const wordCount: { [key: string]: number } = {};

  // Common words to exclude (can be expanded)
  const stopWords = new Set([
    'bir', 'bu', 've', 'de', 'da', 'için', 'mi', 'mı', 'ile', 've',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'is', 'was', 'are', 'were', 'be', 'been', 'i', 'you', 'he', 'she',
  ]);

  texts.forEach(text => {
    const words = text
      .toLowerCase()
      .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, '')
      .split(/\s+/);

    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

/**
 * Simple emotion analysis (MVP version)
 * Can be replaced with AI-based sentiment analysis
 */
function analyzeEmotions(texts: string[]) {
  const emotionKeywords = {
    melancholy: ['üzgün', 'sad', 'yalnız', 'alone', 'sessiz', 'silence', 'karanlık', 'dark'],
    hope: ['umut', 'hope', 'gelecek', 'future', 'iyi', 'good', 'güzel', 'beautiful'],
    joy: ['mutlu', 'happy', 'sevinç', 'joy', 'gülümseme', 'smile'],
    nihilism: ['boş', 'empty', 'anlamsız', 'meaningless', 'yokluk', 'void'],
    neutral: [],
  };

  const scores = {
    melancholy: 0,
    hope: 0,
    joy: 0,
    nihilism: 0,
    neutral: 0,
  };

  texts.forEach(text => {
    const lowerText = text.toLowerCase();
    let matched = false;

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (emotion === 'neutral') continue;
      
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          scores[emotion as keyof typeof scores]++;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      scores.neutral++;
    }
  });

  // Convert to percentages
  const total = texts.length;
  return {
    melancholy: Math.round((scores.melancholy / total) * 100),
    neutral: Math.round((scores.neutral / total) * 100),
    hope: Math.round((scores.hope / total) * 100),
    nihilism: Math.round((scores.nihilism / total) * 100),
    joy: Math.round((scores.joy / total) * 100),
  };
}

/**
 * Generates a manifesto based on epoch data (MVP version)
 * Can be replaced with AI-generated text
 */
function generateManifesto(
  topWords: string[],
  emotions: any,
  totalMessages: number
): string {
  const dominantEmotion = Object.entries(emotions)
    .sort((a, b) => (b[1] as number) - (a[1] as number))[0][0];

  const manifestos: { [key: string]: string[] } = {
    melancholy: [
      'İnsanlık bu döngüde sessizliği seçti.',
      'Yankılar karanlıkta kayboldu.',
      'Yalnızlık, en çok tekrar eden kelimeydi.',
    ],
    hope: [
      'Umut, katmanlar arasında yankılandı.',
      'Gelecek, her yazıda parladı.',
      'İnsanlık ışığı seçti.',
    ],
    nihilism: [
      'Anlamsızlık, tüm katmanları kapladı.',
      'Boşluk, en derin yankıydı.',
      'Hiçlik, toplu bilincin merkeziydi.',
    ],
    joy: [
      'Mutluluk, sessizce yayıldı.',
      'Sevinç, en çok paylaşılan duyguydu.',
      'İnsanlık gülümsedi.',
    ],
    neutral: [
      'İnsanlık bu döngüde dengeyi seçti.',
      'Yazılar, sessizce birikti.',
      'Çağ, sakin bir şekilde kapandı.',
    ],
  };

  const options = manifestos[dominantEmotion] || manifestos.neutral;
  return options[Math.floor(Math.random() * options.length)];
}
