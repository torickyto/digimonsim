import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptjeefvionklmqxovpej.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0amVlZnZpb25rbG1xeG92cGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzNDMzMDEsImV4cCI6MjA0MDkxOTMwMX0.Xedidp2wetXLd4hnjaeYNhE6nCu0neI7R3Oqsxs2mvI';

export const supabase = createClient(supabaseUrl, supabaseKey);