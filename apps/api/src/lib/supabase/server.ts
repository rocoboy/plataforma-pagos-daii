import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest } from 'next/server';
import { Database } from './schema';
// 1. IMPORTA LA LIBRERÍA ESTÁNDAR PARA EL CLIENTE ADMIN
import { createClient as createJSClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

/**
 * Cliente para el LADO DEL CLIENTE (o RLS-aware en el servidor)
 * Este cliente respeta RLS.
 */
export const createClient = (request: NextRequest) => {
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }
  if (!supabaseKey) {
    throw new Error('Missing SUPABASE_ANON_KEY environment variable');
  }

  // Log URL for debugging (without exposing sensitive parts)
  if (process.env.NODE_ENV === 'development') {
    console.log('Creating Supabase client with URL:', supabaseUrl);
  }

  const cookies = request.cookies;

  // (Esta función estaba correcta)
  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookies.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value }) =>
            cookies.set(name, value)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};


// --- INICIO DE LA CORRECCIÓN ---

/**
 * Cliente ADMIN (Service Role)
 * Este cliente IGNORA RLS. Es para operaciones de backend (como webhooks).
 */
export const createAdminClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }

  // 2. USA EL CLIENTE JS ESTÁNDAR (NO el de SSR/cookies)
  return createJSClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
};

// --- FIN DE LA CORRECCIÓN ---