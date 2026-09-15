import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_APARTMENTS = [
  { name: "Apartamento 1", color: "var(--c-series-1)" },
  { name: "Apartamento 2", color: "var(--c-series-2)" },
  { name: "Apartamento 3", color: "var(--c-series-3)" },
  { name: "Apartamento 4", color: "var(--c-series-4)" },
];

export type Apartment = {
  id: string;
  name: string;
  color: string;
};

export async function getOrSeedApartments(
  supabase: SupabaseClient,
  userId: string
): Promise<Apartment[]> {
  const { data: existing } = await supabase
    .from("apartments")
    .select("id, name, color")
    .order("created_at", { ascending: true });

  if (existing && existing.length > 0) {
    return existing;
  }

  const { data: seeded, error } = await supabase
    .from("apartments")
    .insert(DEFAULT_APARTMENTS.map((a) => ({ ...a, owner_id: userId })))
    .select("id, name, color");

  if (error || !seeded) {
    return [];
  }

  return seeded;
}
