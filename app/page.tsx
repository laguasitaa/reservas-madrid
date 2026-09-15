import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrSeedApartments } from "@/lib/apartments";
import HomeClient from "./HomeClient";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const apartments = await getOrSeedApartments(supabase, user.id);

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, apartment_id, start_date, end_date, amount")
    .order("start_date", { ascending: true });

  return (
    <HomeClient apartments={apartments} reservations={reservations ?? []} />
  );
}
