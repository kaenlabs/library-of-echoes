import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Epoch {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  closed_at: string | null;
  stats: EpochStats | null;
}

export interface Layer {
  id: number;
  epoch_id: number;
  layer_index: number;
  min_messages: number;
  max_messages: number;
  theme_name: string;
  css_class: string;
}

export interface Room {
  id: number;
  epoch_id: number;
  layer_index: number;
  room_index: number;
  message_count: number;
}

export interface Message {
  id: string;
  epoch_id: number;
  layer_index: number;
  room_index: number;
  text: string;
  normalized_text: string;
  created_at: string;
}

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

export interface SystemState {
  epoch: string;
  layer: number;
  totalMessages: number;
  babelMoment: boolean;
}

export interface MessageResponse {
  epoch: string;
  layer: number;
  room: number;
  exactCount: number;
  remainingMessages?: number;
}
