import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCrafwEPYG8CMIypw8CQGHD9qkYSy09LJs');

interface EpochAnalysis {
  shortSummary: string;      // Tek cümle özet
  detailedManifesto: string; // Detaylı manifesto (8-12 paragraf)
  emotionalTone: string;      // Duygu tonu
  keyThemes: string[];       // Ana temalar (5-8)
  metaphor?: string;         // Çağı tanımlayan metafor
  closingVerse?: string;     // Şiirsel kapanış
}

/**
 * Generate AI-powered manifesto and analysis for an epoch
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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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

🔮 EN ÇOK YANKILANAN KELİMELER (Kolektif Bilinç Kelimeleri):
${topWords.slice(0, 20).map((w, i) => `${i + 1}. "${w.word}" → ${w.count} yankı`).join('\n')}

💬 EN ÇOK TEKRARLANAN CÜMLELER (İnsanlığın Ortak Sözleri):
${topSentences.slice(0, 15).map((s, i) => `${i + 1}. "${s.text}" → ${s.count} tekrar`).join('\n')}

${timeStats ? `
⏰ ZAMAN ANALİZİ (Kolektif Ritim):
• En Aktif Saat: ${timeStats.peakHour}:00 (${timeStats.hourDistribution.find(h => h.hour === timeStats.peakHour)?.count || 0} mesaj)
• En Aktif Gün: ${timeStats.peakDay} (${timeStats.dayDistribution.find(d => d.day === timeStats.peakDay)?.count || 0} mesaj)
• Gündüz Mesajları (06:00-18:00): %${timeStats.dayPercentage.toFixed(1)}
• Gece Mesajları (18:00-06:00): %${timeStats.nightPercentage.toFixed(1)}

📊 Saatlik Dağılım:
${timeStats.hourDistribution.slice(0, 5).map(h => `  ${h.hour}:00 → ${h.count} mesaj`).join('\n')}

📅 Günlük Dağılım:
${timeStats.dayDistribution.map(d => `  ${d.day} → ${d.count} mesaj`).join('\n')}
` : ''}

═══════════════════════════════════════════════

SENİN GÖREVİN:

Bu çağın **Yeni Dünya Mitolojisi** için manifestosunu yaz. Bu manifesto, gelecek nesillerin bu çağı anlamalarını sağlayacak kutsal bir metin olacak.

1. SHORT_SUMMARY: 
   Tek bir şiirsel cümle ile bu çağın ruhunu yakala. 
   Mistik, düşündürücü ve hafızalarda kalıcı olsun.
   (Max 150 karakter)
   Örnek: "Sessizliğin yankılandığı çağda, insanlar kayıp zamanlarını aradılar."

2. DETAILED_MANIFESTO:
   **15-20 paragraf** uzunluğunda DETAYLI ve EPİK bir manifesto yaz. Bu bir MİTOLOJİ gibi olmalı - her detay analiz edilmeli. Şu bölümleri içermeli:
   
   a) GİRİŞ (1-2 paragraf): 
      - Bu çağın başlangıcı ve atmosferi
      - İnsanlığın bu dönemdeki genel durumu
   
   b) KELİME ANALİZİ (2-3 paragraf):
      - En çok kullanılan kelimelerin derin anlamları
      - Bu kelimelerin neden seçildiği
      - Kelimeler arasındaki gizli bağlantılar
      - Kelimelerin oluşturduğu metafor ve semboller
   
   c) CÜMLE VE DÜŞÜNCE ANALİZİ (2-3 paragraf):
      - Tekrarlanan cümlelerdeki ortak temalar
      - İnsanlar ne aramış, ne bulmuş?
      - Hangi sorular sorulmuş, hangi cevaplar verilmiş?
      - Cümlelerdeki duygusal yükler
   
   d) YANKININ ANALİZİ (1-2 paragraf):
      - Tekrar oranının anlamı (%${(((totalMessages - uniqueMessages) / totalMessages) * 100).toFixed(1)})
      - Neden bazı sesler yankılanmış?
      - Kolektif bilinçaltının ne söylediği
   ${timeStats ? `
   e) ZAMAN VE RİTİM ANALİZİ (2-3 paragraf):
      - Mesajların saat ve gün dağılımının anlamı
      - En aktif saat: ${timeStats.peakHour}:00 - Bu saat neden özel?
      - En aktif gün: ${timeStats.peakDay} - Toplumsal ritim
      - Gece mesajları (%${timeStats.nightPercentage.toFixed(1)}) vs Gündüz (%${timeStats.dayPercentage.toFixed(1)})
      - Gecenin ve gündüzün farklı duygu tonları
      - İnsanlığın sirkadiyen ritmi ve dijital davranışlar
      - Hangi saatlerde hangi tür düşünceler paylaşılmış?
   ` : ''}
   f) FELSEFİK SONUÇ (2-3 paragraf):
      - Bu çağın insanlık tarihindeki yeri
      - Gelecek nesillere bıraktığı miras
      - Evrensel gerçekler ve içgörüler
      - Mistik ve şiirsel bir kapanış

   DİL VE ÜSLUP - ÇOK ÖNEMLİ:
   - Şiirsel ama anlaşılır
   - Felsefi derinlik içeren
   - UZUN PARAGRAFLAR yaz (her paragraf en az 4-5 cümle)
   - Her kelimeyi, her cümleyi, her istatistiği DETAYLI analiz et
   - Metaforlar ve semboller kullan
   - "İnsanlık", "kolektif bilinç", "yankı", "sessizlik", "zaman" gibi kavramları işle
   - Mistik ama saçmalamayan
   - Hem akademik hem de duygusal
   - Türkçe'nin gücünü kullan
   - KISA CÜMLELERDEN KAÇIN - detaylı ve derin yaz
   - Her istatistik bir hikaye anlatsın
   - Zaman verilerini MUTLAKA analiz et (hangi saatte ne olmuş, neden?)
   
   ÖNEMLİ: Bu bir mitoloji! Her şeyi derinlemesine açıkla, analiz et, yorumla!

3. EMOTIONAL_TONE: 
   Bu çağın ruhunu tek kelime ile özetle
   Seçenekler: melankolik, umutlu, kaotik, sessiz, isyankâr, nostaljik, distopik, pastoral, varoluşçu, nihilist, romantik, travmatik, dingin

4. KEY_THEMES: 
   5-8 ana tema belirle (derin kavramlar)
   Örnek: ["yalnızlık ve bağlantı arayışı", "zamanın geçiciliği", "dijital sessizlik", "kolektif hafıza"]

5. METAPHOR:
   Bu çağı tanımlayan güçlü bir metafor
   Örnek: "Karanlık bir odada fısıldaşan ruhlar"

6. CLOSING_VERSE:
   2-4 satırlık şiirsel bir kapanış dizesi
   Örnek: "Ve sessizlik bozuldu / Kelimeler yankılandı / İnsanlık bir kez daha / Kendini dinledi"

JSON FORMATINDA DÖNDÜR:
{
  "shortSummary": "...",
  "detailedManifesto": "... (15-20 UZUN paragraf, MİNİMUM 4000 karakter - her paragraf detaylı analiz içermeli)",
  "emotionalTone": "...",
  "keyThemes": ["...", "...", "...", "...", "...", "...", "..."],
  "metaphor": "...",
  "closingVerse": "..."
}

⚠️ ÇOK ÖNEMLİ: detailedManifesto alanı MİNİMUM 4000 karakter olmalı! Her paragraf detaylı, her analiz derin olmalı. Bu bir MİTOLOJİ - kısa ve yüzeysel değil, UZUN ve DERİN olmalı!
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const analysis: EpochAnalysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Gemini AI error:', error);
    
    // Fallback to basic analysis
    return {
      shortSummary: `${epochName} sessizlikle kapandı.`,
      detailedManifesto: `Bu çağda ${totalMessages.toLocaleString()} mesaj yazıldı. İnsanlar "${topWords[0]?.word || 'kelimeler'}" ve "${topWords[1]?.word || 'düşünceler'}" hakkında konuştu. ${uniqueMessages.toLocaleString()} eşsiz ses duyuldu, ancak ${totalMessages - uniqueMessages} mesaj tekrarlandı. Bu, insanlığın ortak deneyimlerini paylaştığını gösteriyor.`,
      emotionalTone: 'düşünceli',
      keyThemes: topWords.slice(0, 5).map(w => w.word),
    };
  }
}

/**
 * Generate emotional distribution analysis
 */
export async function analyzeEmotionalDistribution(
  topSentences: { text: string; count: number }[]
): Promise<{ emotion: string; percentage: number; color: string }[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `
En çok tekrarlanan cümlelere bakarak duygusal dağılım analizi yap:

${topSentences.slice(0, 20).map((s, i) => `${i + 1}. "${s.text}"`).join('\n')}

Bu cümleleri şu duygu kategorilerine ayır ve yüzdelik dağılım ver:
- Melankoli (hüzün, kayıp, özlem)
- Umut (iyimserlik, gelecek, pozitiflik)
- Yalnızlık (izolasyon, sessizlik, yabancılaşma)
- Öfke (isyan, hayal kırıklığı, tepki)
- Nötr (gündelik, sıradan, duygusuz)
- Şükran (minnettarlık, takdir, mutluluk)

JSON formatında döndür:
[
  { "emotion": "Melankoli", "percentage": 35, "color": "#9b59b6" },
  { "emotion": "Yalnızlık", "percentage": 25, "color": "#34495e" },
  ...
]

Toplam yüzde 100 olmalı. En az 3, en fazla 6 duygu kategorisi kullan.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const emotions = JSON.parse(jsonMatch[0]);
    return emotions;
  } catch (error) {
    console.error('Emotion analysis error:', error);
    
    // Fallback emotions
    return [
      { emotion: 'Melankoli', percentage: 35, color: '#9b59b6' },
      { emotion: 'Yalnızlık', percentage: 30, color: '#34495e' },
      { emotion: 'Umut', percentage: 20, color: '#3498db' },
      { emotion: 'Nötr', percentage: 15, color: '#95a5a6' },
    ];
  }
}
