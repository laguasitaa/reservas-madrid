import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_APARTMENTS = [
  { name: "COLON III (621)", color: "var(--c-cat-yellow)" },
  { name: "COLON IV (609)", color: "var(--c-cat-blue)" },
  { name: "COLON V (1318)", color: "var(--c-cat-red)" },
  { name: "COLON VII (1214)", color: "var(--c-cat-purple)" },
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
