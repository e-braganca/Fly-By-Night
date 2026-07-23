import { createClient } from "@supabase/supabase-js";

/*
  Browser Supabase client.

  Nothing imports this yet — the app still runs entirely on the in-memory
  Zustand store (lib/store.ts) with seed data under lib/data/*. This is the
  entry point for migrating to a real backend: set the two env vars below
  (locally in .env.local, and in Netlify → Site settings → Environment
  variables), then start replacing the seed reads/writes with queries against
  `supabase`, one entity at a time.

  Because it's not imported anywhere, an unset env var won't break the build —
  it only matters once you actually use this client.
*/

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example).",
  );
}

export const supabase = createClient(url, anonKey);
