// Content moderation utilities

// Basic spam patterns
const SPAM_PATTERNS = [
  /https?:\/\//gi, // URLs
  /www\./gi, // www links
  /\b\d{10,}\b/g, // Long numbers (phone numbers)
  /@\w+\.(com|net|org)/gi, // Email-like patterns
];

// Excessive repetition
const REPETITION_THRESHOLD = 5;

export function checkSpamContent(text: string): { 
  valid: boolean; 
  reason?: string;
} {
  // Check for URLs and links
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return { 
        valid: false, 
        reason: 'Link, URL veya iletişim bilgisi içeremez' 
      };
    }
  }

  // Check for excessive character repetition
  const chars = text.toLowerCase().split('');
  let maxRepeat = 1;
  let currentRepeat = 1;
  
  for (let i = 1; i < chars.length; i++) {
    if (chars[i] === chars[i - 1]) {
      currentRepeat++;
      maxRepeat = Math.max(maxRepeat, currentRepeat);
    } else {
      currentRepeat = 1;
    }
  }

  if (maxRepeat > REPETITION_THRESHOLD) {
    return { 
      valid: false, 
      reason: 'Aşırı tekrar içeriyor' 
    };
  }

  // Check for excessive caps
  const upperCount = (text.match(/[A-ZÇĞİÖŞÜ]/g) || []).length;
  const letterCount = (text.match(/[a-zA-ZçğıöşüÇĞİÖŞÜ]/g) || []).length;
  
  if (letterCount > 10 && upperCount / letterCount > 0.7) {
    return { 
      valid: false, 
      reason: 'Çok fazla büyük harf kullanımı' 
    };
  }

  // Check minimum meaningful content
  const words = text.trim().split(/\s+/);
  const meaningfulWords = words.filter(w => w.length > 1);
  
  if (meaningfulWords.length === 0) {
    return { 
      valid: false, 
      reason: 'Anlamlı içerik bulunamadı' 
    };
  }

  return { valid: true };
}

// Check for duplicate/similar recent messages (simple version)
export function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}
