import { supabase } from './supabase';
import { Digimon, DigimonEgg } from './shared/types';
import { PostgrestError } from '@supabase/supabase-js';

export interface PlayerData {
  owned_digimon: Digimon[];
  player_team: Digimon[];
  eggs: DigimonEgg[];
  bits: number;
  day_count: number;
}

export async function savePlayerData(userId: string, gameData: PlayerData) {
  const { data, error } = await supabase
    .from('player_data')
    .upsert({ user_id: userId, ...gameData }, { onConflict: 'user_id' });

  return { data, error };
}

export async function loadPlayerData(userId: string): Promise<{ data: PlayerData | null, error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('player_data')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}