// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Get environment variables from process.env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);