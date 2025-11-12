import Groq from 'groq-sdk';

// Initialize Groq AI (much faster and more generous free tier than Gemini)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

interface EpochAnalysis {
  shortSummary: string;
  detailedManifesto: string;
  emotionalTone: string;
  keyThemes: string[];
  metaphor?: string;
  closingVerse?: string;
  coordinatedAction?: {
    detected: boolean;
    keyword: string;
    count: number;
    commentary: string; // Esprili yorum
  };
}

/**
 * Generate AI-powered manifesto using Groq (Mixtral or Llama)
 * FREE TIER: 14,400 requests/day, 6,000 tokens/minute
 */
export async function generateEpochManifesto(
  epochName: string,
  totalMessages: number,
  uniqueMessages: number,
  topWords: { word: string; count: number }[],
  topSentences: { text: string; count: number }[],
  timeStats?: {
    hourDistribution: { hour: number; count: number }[];
    dayDistribution: { day: string; count: number }[];
    peakHour: number;
    peakDay: string;
    nightPercentage: number;
    dayPercentage: number;
  }
): Promise<EpochAnalysis> {
  const prompt = `
Sen "Yeni Dünya Mitolojisi"nin baş arşivcisisin. "Library of Echoes" adlı dijital tapınaktaki bir çağı (epoch) analiz ediyorsun. Bu çağ, insanlığın kolektif bilinçaltının bir anlık fotoğrafı.

═══════════════════════════════════════════════
ÇAĞ: ${epochName}
═══════════════════════════════════════════════

📊 NİCELİK VERİLERİ:
• Toplam Ses: ${totalMessages.toLocaleString()} yankı
• Özgün Sesler: ${uniqueMessages.toLocaleString()} 
• Tekrar Oranı: %${(((totalMessages - uniqueMessages) / totalMessages) * 100).toFixed(1)}
• Yankı Sayısı: ${totalMessages - uniqueMessages}

🔮 EN ÇOK YANKILANAN KELİMELER:
${topWords.slice(0, 20).map((w, i) => `${i + 1}. "${w.word}" → ${w.count} yankı`).join('\n')}

💬 EN ÇOK TEKRARLANAN CÜMLELER:
${topSentences.slice(0, 15).map((s, i) => `${i + 1}. "${s.text}" → ${s.count} tekrar`).join('\n')}

${timeStats ? `
⏰ ZAMAN ANALİZİ:
• En Aktif Saat: ${timeStats.peakHour}:00 (${timeStats.hourDistribution.find(h => h.hour === timeStats.peakHour)?.count || 0} mesaj)
• En Aktif Gün: ${timeStats.peakDay}
• Gündüz: %${timeStats.dayPercentage.toFixed(1)} | Gece: %${timeStats.nightPercentage.toFixed(1)}
` : ''}

═══════════════════════════════════════════════

🎯 KOORDİNELİ EYLEM TESPİTİ:
Eğer insanlar toplu olarak aynı kelimeyi yazmışsa (örn: "fenerbahçe", "galatasaray", bir meme, bir isim, vb.)
ve bu kelime normalden çok daha fazla tekrarlanmışsa, bunu tespit et!

ŞARTLAR:
- Kelime en az 50 kez tekrarlanmış olmalı
- Diğer kelimelere göre anormal derecede öne çıkmalı
- Koordineli hareket izlenimi vermeli

JSON formatında bir analiz oluştur:

{
  "shortSummary": "Tek şiirsel cümle (max 150 karakter)",
  "detailedManifesto": "15-20 UZUN paragraf, MİNİMUM 4000 karakter. Bu bir MİTOLOJİ - her kelimeyi, her istatistiği, zaman verilerini detaylı analiz et. Şiirsel, felsefi, derin olmalı.",
  "emotionalTone": "melankolik/umutlu/kaotik/sessiz/isyankâr/nostaljik/distopik/pastoral/varoluşçu/nihilist/romantik/travmatik/dingin",
  "keyThemes": ["tema 1", "tema 2", "tema 3", "tema 4", "tema 5", "tema 6"],
  "metaphor": "Bu çağı tanımlayan güçlü metafor",
  "closingVerse": "2-4 satırlık şiirsel kapanış",
  "coordinatedAction": {
    "detected": true/false,
    "keyword": "tespit edilen kelime (varsa)",
    "count": kelime sayısı,
    "commentary": "2-3 cümlelik ESPRİLİ yorum. İnsanları organize olmakla şakacı şekilde kutla veya eleştir. Örnek: 'Ah, 200 kişi toplanmış Fenerbahçe yazıyor. Dijital tribün mü kurdunuz yoksa? Kolektif şuur şampiyonluğu mu peşinde?'"
  }
}

NOT: Eğer koordineli eylem yoksa, coordinatedAction.detected = false yap ve diğer alanları boş bırak.

SADECE JSON döndür, başka hiçbir şey ekleme.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only API. You MUST respond ONLY with valid JSON. No explanations, no markdown, no text before or after. ONLY the JSON object.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile', // Latest model, very capable
      temperature: 0.7, // Lower for more consistent JSON
      max_tokens: 4000,
      response_format: { type: 'json_object' }, // Force JSON mode
    });

    const text = completion.choices[0]?.message?.content || '';
    
    console.log('🤖 Raw AI Response:', text.substring(0, 200)); // Debug
    
    // Extract JSON from response - be more aggressive
    // Sometimes AI adds markdown ```json or explanations
    let cleanText = text
      .replace(/```json\s*/g, '')  // Remove ```json
      .replace(/```\s*/g, '')       // Remove ```
      .trim();
    
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in AI response:', text);
      throw new Error('Invalid AI response format');
    }

    // Clean JSON string - remove problematic characters
    let jsonString = jsonMatch[0];
    // Replace control characters that break JSON parsing
    jsonString = jsonString
      .replace(/[\n\r\t]/g, ' ')  // Replace newlines, tabs with spaces
      .replace(/\s+/g, ' ');       // Normalize whitespace

    const analysis: EpochAnalysis = JSON.parse(jsonString);
    return analysis;
  } catch (error) {
    console.error('Groq AI error:', error);
    throw error; // Let the caller handle fallback
  }
}

/**
 * Generate emotional distribution analysis using Groq
 * Fixed 12 emotion categories with AI-determined percentages
 */
export async function analyzeEmotionalDistribution(
  topSentences: { text: string; count: number }[],
  topWords: { word: string; count: number }[]
): Promise<{ emotion: string; percentage: number; color: string }[]> {
  const prompt = `
En çok tekrarlanan cümlelere ve kelimelere bakarak duygusal dağılım analizi yap:

CÜMLELER:
${topSentences.slice(0, 15).map((s, i) => `${i + 1}. "${s.text}" (${s.count}x)`).join('\n')}

KELİMELER:
${topWords.slice(0, 20).map((w, i) => `${i + 1}. "${w.word}" (${w.count}x)`).join('\n')}

Bu mesajları analiz ederek aşağıdaki SABİT 12 duygu kategorisine YÜZDE OLARAK dağıt.
Her duygunun yüzdesini belirle. Toplamları %100 olmalı.

SABİT DUYGULAR:
1. Melankoli (hüzün, kayıp, özlem, nostalji)
2. Umut (iyimserlik, gelecek, pozitiflik, heyecan)
3. Yalnızlık (izolasyon, sessizlik, yabancılaşma)
4. Öfke (isyan, hayal kırıklığı, tepki, öfke)
5. Şükran (minnettarlık, takdir, mutluluk, sevgi)
6. Korku (endişe, panik, tedirginlik)
7. Aşk (romantizm, tutku, sevgi, bağlılık)
8. Merak (sorgulama, keşif, ilgi)
9. Eğlence (mizah, kahkaha, şakacılık)
10. Dinginlik (huzur, sükûnet, rahatlık)
11. Nostaljik (geçmiş özlemi, anılar)
12. Nötr (gündelik, sıradan, duygusuz)

JSON formatında döndür (toplam %100):
[
  { "emotion": "Melankoli", "percentage": 15, "color": "#9b59b6" },
  { "emotion": "Umut", "percentage": 12, "color": "#3498db" },
  { "emotion": "Yalnızlık", "percentage": 10, "color": "#34495e" },
  { "emotion": "Öfke", "percentage": 8, "color": "#e74c3c" },
  { "emotion": "Şükran", "percentage": 18, "color": "#2ecc71" },
  { "emotion": "Korku", "percentage": 5, "color": "#f39c12" },
  { "emotion": "Aşk", "percentage": 7, "color": "#e91e63" },
  { "emotion": "Merak", "percentage": 9, "color": "#00bcd4" },
  { "emotion": "Eğlence", "percentage": 4, "color": "#ff9800" },
  { "emotion": "Dinginlik", "percentage": 3, "color": "#607d8b" },
  { "emotion": "Nostaljik", "percentage": 6, "color": "#8e44ad" },
  { "emotion": "Nötr", "percentage": 3, "color": "#95a5a6" }
]

ÖNEMLI: Her duygu MUTLAKA listede olmalı (12 tane). Toplamları %100 olmalı.
SADECE JSON array döndür.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only API. Respond ONLY with valid JSON array. No text, no markdown.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 1000,
    });

    const text = completion.choices[0]?.message?.content || '';
    
    // Clean markdown formatting
    let cleanText = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('❌ No JSON array found in emotion analysis:', text);
      throw new Error('Invalid AI response format');
    }

    // Clean JSON string
    let jsonString = jsonMatch[0];
    jsonString = jsonString
      .replace(/[\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ');

    const emotions = JSON.parse(jsonString);
    return emotions;
  } catch (error) {
    console.error('Groq emotion analysis error:', error);
    throw error;
  }
}
