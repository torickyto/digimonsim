import { createClient } from '@supabase/supabase-js';

   console.log('Environment variables:', process.env);
   console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
   console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
   const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

   if (!supabaseUrl) {
     console.error('NEXT_PUBLIC_SUPABASE_URL is not set');
     throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in the environment variables');
   }
   if (!supabaseKey) {
     console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
     throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in the environment variables');
   }

   export const supabase = createClient(supabaseUrl, supabaseKey);