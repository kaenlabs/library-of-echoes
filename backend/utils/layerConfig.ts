// Layer configuration with dynamic room system
// This matches web/lib/layers.ts for consistency

export interface LayerConfig {
  index: number;
  min: number;
  max: number;
  name: string;
  theme: string;
  roman: string;
  rooms: number;           // Total number of rooms in this layer
  roomCapacity: number;    // Messages per room before moving to next
}

export const LAYER_CONFIG: LayerConfig[] = [
  { index: 1, min: 0, max: 100, name: 'Void', theme: 'layer-1', roman: 'I', rooms: 10, roomCapacity: 10 },
  { index: 2, min: 100, max: 500, name: 'Whisper', theme: 'layer-2', roman: 'II', rooms: 10, roomCapacity: 40 },
  { index: 3, min: 500, max: 1000, name: 'Glitch', theme: 'layer-3', roman: 'III', rooms: 10, roomCapacity: 50 },
  { index: 4, min: 1000, max: 2000, name: 'Wave', theme: 'layer-4', roman: 'IV', rooms: 20, roomCapacity: 50 },
  { index: 5, min: 2000, max: 4000, name: 'Neon', theme: 'layer-5', roman: 'V', rooms: 25, roomCapacity: 80 },
  { index: 6, min: 4000, max: 8000, name: 'Ambient', theme: 'layer-6', roman: 'VI', rooms: 40, roomCapacity: 100 },
  { index: 7, min: 8000, max: 50000, name: 'Chaos', theme: 'layer-7', roman: 'VII', rooms: 100, roomCapacity: 420 },
  { index: 8, min: 50000, max: 100000, name: 'Burst', theme: 'layer-8', roman: 'VIII', rooms: 200, roomCapacity: 250 },
  { index: 9, min: 100000, max: Infinity, name: 'Babel', theme: 'layer-9', roman: 'IX', rooms: 1024, roomCapacity: 1000 },
];

export const BABEL_THRESHOLD = 1024808; // Pi * 326144

/**
 * Get current layer based on total message count
 */
export function getCurrentLayer(totalMessages: number): number {
  for (const layer of LAYER_CONFIG) {
    if (totalMessages >= layer.min && totalMessages < layer.max) {
      return layer.index;
    }
  }
  return LAYER_CONFIG[LAYER_CONFIG.length - 1].index;
}

/**
 * Get layer information by index
 */
export function getLayerInfo(layerIndex: number): LayerConfig | undefined {
  return LAYER_CONFIG.find(layer => layer.index === layerIndex);
}

/**
 * Calculate room index for a message
 * Based on: (messagesInLayer / roomCapacity) % totalRooms
 */
export function getRoomIndex(messagesInLayer: number, layerIndex: number): number {
  const layer = LAYER_CONFIG.find(l => l.index === layerIndex);
  if (!layer) return 0;
  
  // Calculate which room based on layer's room capacity
  return Math.floor(messagesInLayer / layer.roomCapacity) % layer.rooms;
}

/**
 * Get room capacity for a specific layer
 */
export function getRoomCapacity(layerIndex: number): number {
  const layer = LAYER_CONFIG.find(l => l.index === layerIndex);
  return layer?.roomCapacity || 10;
}

/**
 * Get total rooms for a specific layer
 */
export function getTotalRooms(layerIndex: number): number {
  const layer = LAYER_CONFIG.find(l => l.index === layerIndex);
  return layer?.rooms || 10;
}
