import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { Database } from "./schema";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const createClient = (request: NextRequest) => {
  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL environment variable");
  }
  if (!supabaseKey) {
    throw new Error("Missing SUPABASE_ANON_KEY environment variable");
  }

  // Log URL for debugging (without exposing sensitive parts)
  if (process.env.NODE_ENV === "development") {
    console.log("Creating Supabase client with URL:", supabaseUrl);
  }

  const cookies = request.cookies;

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

// Admin/client with service role key - use only on server-side for admin endpoints
export const createAdminClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }
  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL environment variable");
  }

  // provide a minimal cookies implementation required by createServerClient
  return createServerClient<Database>(supabaseUrl, serviceKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // no-op for admin server client
      },
    },
  });
};
