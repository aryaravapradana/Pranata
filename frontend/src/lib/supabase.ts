import { createClient } from "@supabase/supabase-js";

// Pastikan .env.local memiliki SUPABASE_URL dan SUPABASE_ANON_KEY
// Untuk Next.js client component, gunakan NEXT_PUBLIC_ prefix
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder.supabase.co";
const supabaseKey =
  process.env
    .NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-anon-key";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
);
