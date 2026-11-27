import "server-only";
import type { Repository } from "./repo";
import { localRepo } from "./local";
import { createSupabaseRepo } from "./supabase";

let repo: Repository | null = null;

export function db(): Repository {
  if (repo) return repo;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  repo = url && key ? createSupabaseRepo(url, key, process.env.SUPABASE_STORAGE_BUCKET || "valuation-photos") : localRepo;
  return repo;
}

export const usingSupabase = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
