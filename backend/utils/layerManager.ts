/**
 * Layer Manager
 * Handles layer logic and message distribution across layers
 */

// Layer configuration (matches database schema)
export const LAYER_CONFIG = [
  { index: 1, min: 0, max: 100, name: 'Void', theme: 'layer-1' },
  { index: 2, min: 100, max: 500, name: 'Whisper', theme: 'layer-2' },
  { index: 3, min: 500, max: 1000, name: 'Glitch', theme: 'layer-3' },
  { index: 4, min: 1000, max: 2000, name: 'Wave', theme: 'layer-4' },
  { index: 5, min: 2000, max: 4000, name: 'Neon', theme: 'layer-5' },
  { index: 6, min: 4000, max: 8000, name: 'Ambient', theme: 'layer-6' },
  { index: 7, min: 8000, max: 50000, name: 'Chaos', theme: 'layer-7' },
  { index: 8, min: 50000, max: 100000, name: 'Burst', theme: 'layer-8' },
  { index: 9, min: 100000, max: Infinity, name: 'Babel', theme: 'layer-9' },
];

// Number of rooms per layer
export const ROOMS_PER_LAYER = 10;

// Threshold for Babel Moment (epoch closure)
export const BABEL_THRESHOLD = 1024808; // Can be adjusted

/**
 * Determines which layer a message should be placed in
 * based on total message count in the epoch
 */
export function getCurrentLayer(totalMessages: number): number {
  for (const layer of LAYER_CONFIG) {
    if (totalMessages >= layer.min && totalMessages < layer.max) {
      return layer.index;
    }
  }
  // Default to last layer if beyond all thresholds
  return LAYER_CONFIG[LAYER_CONFIG.length - 1].index;
}

/**
 * Gets layer information by index
 */
export function getLayerInfo(layerIndex: number) {
  return LAYER_CONFIG.find(layer => layer.index === layerIndex);
}

/**
 * Determines which room a message should go to within a layer
 * Uses modulo operation on the layer's message count
 */
export function getRoomIndex(messagesInLayer: number): number {
  return messagesInLayer % ROOMS_PER_LAYER;
}

/**
 * Converts layer index to Roman numeral (for display)
 */
export function toRomanNumeral(num: number): string {
  const romanNumerals: [number, string][] = [
    [9, 'IX'],
    [8, 'VIII'],
    [7, 'VII'],
    [6, 'VI'],
    [5, 'V'],
    [4, 'IV'],
    [3, 'III'],
    [2, 'II'],
    [1, 'I'],
  ];

  for (const [value, numeral] of romanNumerals) {
    if (num === value) {
      return numeral;
    }
  }
  return num.toString();
}

/**
 * Checks if Babel Moment should be triggered
 */
export function shouldTriggerBabelMoment(totalMessages: number): boolean {
  return totalMessages >= BABEL_THRESHOLD;
}

/**
 * Normalizes message text for duplicate detection
 * Removes extra whitespace, converts to lowercase, removes punctuation
 */
export function normalizeMessage(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, '') // Keep alphanumeric and Turkish chars
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Validates message text
 */
export function validateMessage(text: string): { valid: boolean; error?: string } {
  const trimmed = text.trim();

  if (!trimmed) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Message too long (max 500 characters)' };
  }

  if (trimmed.includes('\n')) {
    return { valid: false, error: 'Message must be a single line' };
  }

  return { valid: true };
}
