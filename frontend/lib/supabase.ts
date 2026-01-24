import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Klient publiczny (dla frontendu)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funkcja tworząca klienta publicznego (dla API routes - odczyt)
export function createPublicClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Klient z service_role (tylko dla API routes na serwerze)
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_KEY environment variable');
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
