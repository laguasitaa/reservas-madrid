"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReservationState = { error: string | null; ok?: boolean };

const EXCLUSION_VIOLATION = "23P01";

export async function createReservation(
  _prevState: ReservationState,
  formData: FormData
): Promise<ReservationState> {
  const apartmentId = String(formData.get("apartment_id") ?? "");
  const startDate = String(formData.get("start_date") ?? "");
  const endDate = String(formData.get("end_date") ?? "");
  const amountRaw = String(formData.get("amount") ?? "");
  const guestNameRaw = String(formData.get("guest_name") ?? "").trim();

  if (!apartmentId || !startDate || !endDate) {
    return { error: "Faltan datos — revisa el apartamento y las fechas." };
  }

  if (endDate <= startDate) {
    return { error: "La fecha de salida debe ser después de la de llegada." };
  }

  const amount = amountRaw.trim() === "" ? null : Number(amountRaw);
  if (amountRaw.trim() !== "" && Number.isNaN(amount)) {
    return { error: "El monto debe ser un número." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró — vuelve a entrar." };
  }

  const { error } = await supabase.from("reservations").insert({
    apartment_id: apartmentId,
    owner_id: user.id,
    start_date: startDate,
    end_date: endDate,
    amount,
    guest_name: guestNameRaw === "" ? null : guestNameRaw,
  });

  if (error) {
    if (error.code === EXCLUSION_VIOLATION) {
      return {
        error: "Esas fechas ya están ocupadas en este apartamento — elige otras.",
      };
    }
    return { error: "No se pudo guardar la reserva. Intenta de nuevo." };
  }

  revalidatePath("/");
  return { error: null, ok: true };
}
