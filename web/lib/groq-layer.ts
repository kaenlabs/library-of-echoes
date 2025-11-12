import Groq from 'groq-sdk';

// Initialize Groq AI for Layer Moments (lighter version)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

interface LayerAnalysis {
  shortSummary: string;
  detailedManifesto: string;
  emotionalTone: string;
  keyThemes: string[];
  metaphor?: string;
}

/**
 * Generate Layer Moment analysis - optimized for speed and conciseness
 * Layer 1: All words included
 * Layer 2+: Stop words filtered, minimum 2 repetitions
 */
export async function generateLayerMoment(
  epochName: string,
  layerName: string,
  layerIndex: number,
  totalMessages: number,
  uniqueMessages: number,
  topWords: { word: string; count: number }[],
  topSentences: { text: string; count: number }[]
): Promise<LayerAnalysis> {
  
  // Layer 1: Show all data (small dataset)
  // Layer 2+: Show top 10 words, top 5 sentences (optimized)
  const wordLimit = layerIndex === 1 ? topWords.length : 10;
  const sentenceLimit = layerIndex === 1 ? topSentences.length : 5;
  
  const prompt = `
Sen "Library of Echoes" dijital tapınağının katman analizcisisin.

═══════════════════════════════════════════════
${epochName} - ${layerName}
═══════════════════════════════════════════════

📊 KATMAN İSTATİSTİKLERİ:
• Toplam Mesaj: ${totalMessages.toLocaleString()}
• Özgün Sesler: ${uniqueMessages.toLocaleString()}
• Yankı Oranı: %${(((totalMessages - uniqueMessages) / totalMessages) * 100).toFixed(1)}
• Katman Seviyesi: ${layerIndex}

🔮 EN ÇOK YANKILANAN KELİMELER (Top ${wordLimit}):
${topWords.slice(0, wordLimit).map((w, i) => `${i + 1}. "${w.word}" → ${w.count}x`).join('\n')}

💬 EN ÇOK TEKRARLANAN CÜMLELER (Top ${sentenceLimit}):
${topSentences.slice(0, sentenceLimit).map((s, i) => `${i + 1}. "${s.text}" → ${s.count}x`).join('\n')}

═══════════════════════════════════════════════

🎯 GÖREV:
Bu bir KATMAN GEÇİŞİ - insanlığın kolektif bilinci yeni bir seviyeye ulaştı.

KISA ama DERİN bir analiz yap (3000-4000 karakter):
• Şiirsel, mitolojik dil kullan
• Her kelimeyi ve cümleyi analiz et
• ${layerName} katmanının ruhunu yakala
• İnsanlığın bu anını yorumla

JSON formatında döndür:
{
  "shortSummary": "Katmanı özetleyen TEK şiirsel cümle (max 150 karakter)",
  "detailedManifesto": "10-12 paragraf. Şiirsel ve derin. Her kelimeyi analiz et. 3000-4000 karakter.",
  "emotionalTone": "melankolik/umutlu/kaotik/sessiz/dinamik/nostaljik",
  "keyThemes": ["tema1", "tema2", "tema3", "tema4", "tema5"],
  "metaphor": "Bu katmanı tanımlayan güçlü metafor"
}

SADECE JSON döndür, başka hiçbir şey ekleme.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only API. You MUST respond ONLY with valid JSON. No explanations, no markdown, no text before or after.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const text = completion.choices[0]?.message?.content || '';
    
    // Clean JSON extraction
    let cleanText = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in Layer AI response:', text);
      throw new Error('Invalid AI response format');
    }

    let jsonString = jsonMatch[0];
    jsonString = jsonString
      .replace(/[\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ');

    const analysis: LayerAnalysis = JSON.parse(jsonString);
    return analysis;
  } catch (error) {
    console.error('Groq Layer AI error:', error);
    throw error;
  }
}

/**
 * Generate emotional distribution for Layer Moments
 * Lighter version - only top 6 emotions
 */
export async function analyzeLayerEmotions(
  topSentences: { text: string; count: number }[],
  topWords: { word: string; count: number }[],
  layerIndex: number
): Promise<{ emotion: string; percentage: number; color: string }[]> {
  
  // Layer 1: Show all sentences/words
  // Layer 2+: Show top 5 sentences, top 10 words
  const sentenceLimit = layerIndex === 1 ? topSentences.length : 5;
  const wordLimit = layerIndex === 1 ? topWords.length : 10;
  
  const prompt = `
Mesaj analizi yaparak duygusal dağılım belirle:

CÜMLELER:
${topSentences.slice(0, sentenceLimit).map((s, i) => `${i + 1}. "${s.text}" (${s.count}x)`).join('\n')}

KELİMELER:
${topWords.slice(0, wordLimit).map((w, i) => `${i + 1}. "${w.word}" (${w.count}x)`).join('\n')}

SABİT 6 duygu kategorisine dağıt (toplam %100):

[
  { "emotion": "Melankoli", "percentage": 20, "color": "#9b59b6" },
  { "emotion": "Umut", "percentage": 25, "color": "#3498db" },
  { "emotion": "Merak", "percentage": 15, "color": "#00bcd4" },
  { "emotion": "Öfke", "percentage": 10, "color": "#e74c3c" },
  { "emotion": "Eğlence", "percentage": 20, "color": "#ff9800" },
  { "emotion": "Nötr", "percentage": 10, "color": "#95a5a6" }
]

Her duygu MUTLAKA listede olmalı. Toplamları %100 olmalı.
SADECE JSON array döndür.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only API. Respond ONLY with valid JSON array.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const text = completion.choices[0]?.message?.content || '';
    
    let cleanText = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('❌ No JSON array in layer emotion:', text);
      throw new Error('Invalid AI response');
    }

    let jsonString = jsonMatch[0];
    jsonString = jsonString
      .replace(/[\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ');

    const emotions = JSON.parse(jsonString);
    return emotions;
  } catch (error) {
    console.error('Groq layer emotion error:', error);
    throw error;
  }
}
