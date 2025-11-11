// Layer configuration (matches backend)
export const LAYER_CONFIG = [
  { index: 1, min: 0, max: 100, name: 'Void', theme: 'layer-1', roman: 'I' },
  { index: 2, min: 100, max: 500, name: 'Whisper', theme: 'layer-2', roman: 'II' },
  { index: 3, min: 500, max: 1000, name: 'Glitch', theme: 'layer-3', roman: 'III' },
  { index: 4, min: 1000, max: 2000, name: 'Wave', theme: 'layer-4', roman: 'IV' },
  { index: 5, min: 2000, max: 4000, name: 'Neon', theme: 'layer-5', roman: 'V' },
  { index: 6, min: 4000, max: 8000, name: 'Ambient', theme: 'layer-6', roman: 'VI' },
  { index: 7, min: 8000, max: 50000, name: 'Chaos', theme: 'layer-7', roman: 'VII' },
  { index: 8, min: 50000, max: 100000, name: 'Burst', theme: 'layer-8', roman: 'VIII' },
  { index: 9, min: 100000, max: Infinity, name: 'Babel', theme: 'layer-9', roman: 'IX' },
];

export const ROOMS_PER_LAYER = 10;
export const BABEL_THRESHOLD = 1024808;

export function getCurrentLayer(totalMessages: number): number {
  for (const layer of LAYER_CONFIG) {
    if (totalMessages >= layer.min && totalMessages < layer.max) {
      return layer.index;
    }
  }
  return LAYER_CONFIG[LAYER_CONFIG.length - 1].index;
}

export function getLayerInfo(layerIndex: number) {
  return LAYER_CONFIG.find(layer => layer.index === layerIndex);
}

export function getRoomIndex(messagesInLayer: number): number {
  return messagesInLayer % ROOMS_PER_LAYER;
}

export function normalizeMessage(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, '')
    .replace(/\s+/g, ' ');
}

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
