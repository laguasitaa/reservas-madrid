"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReservationState = { error: string | null; ok?: boolean };

const EXCLUSION_VIOLATION = "23P01";

function parseReservationForm(formData: FormData) {
  const apartmentId = String(formData.get("apartment_id") ?? "");
  const startDate = String(formData.get("start_date") ?? "");
  const endDate = String(formData.get("end_date") ?? "");
  const amountRaw = String(formData.get("amount") ?? "");
  const guestNameRaw = String(formData.get("guest_name") ?? "").trim();

  if (!apartmentId || !startDate || !endDate) {
    return {
      ok: false,
      error: "Faltan datos — revisa el apartamento y las fechas.",
    } as const;
  }

  if (endDate <= startDate) {
    return {
      ok: false,
      error: "La fecha de salida debe ser después de la de llegada.",
    } as const;
  }

  const amount = amountRaw.trim() === "" ? null : Number(amountRaw);
  if (amountRaw.trim() !== "" && Number.isNaN(amount)) {
    return { ok: false, error: "El monto debe ser un número." } as const;
  }

  return {
    ok: true,
    apartmentId,
    startDate,
    endDate,
    amount,
    guestName: guestNameRaw === "" ? null : guestNameRaw,
  } as const;
}

export async function createReservation(
  _prevState: ReservationState,
  formData: FormData
): Promise<ReservationState> {
  const parsed = parseReservationForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró — vuelve a entrar." };
  }

  const { error } = await supabase.from("reservations").insert({
    apartment_id: parsed.apartmentId,
    owner_id: user.id,
    start_date: parsed.startDate,
    end_date: parsed.endDate,
    amount: parsed.amount,
    guest_name: parsed.guestName,
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

export async function updateReservation(
  _prevState: ReservationState,
  formData: FormData
): Promise<ReservationState> {
  const reservationId = String(formData.get("reservation_id") ?? "");
  if (!reservationId) {
    return { error: "No se encontró la reserva a editar." };
  }

  const parsed = parseReservationForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión expiró — vuelve a entrar." };
  }

  const { error } = await supabase
    .from("reservations")
    .update({
      apartment_id: parsed.apartmentId,
      start_date: parsed.startDate,
      end_date: parsed.endDate,
      amount: parsed.amount,
      guest_name: parsed.guestName,
    })
    .eq("id", reservationId);

  if (error) {
    if (error.code === EXCLUSION_VIOLATION) {
      return {
        error: "Esas fechas ya están ocupadas en este apartamento — elige otras.",
      };
    }
    return { error: "No se pudo guardar el cambio. Intenta de nuevo." };
  }

  revalidatePath("/");
  return { error: null, ok: true };
}

export async function deleteReservation(
  _prevState: ReservationState,
  formData: FormData
): Promise<ReservationState> {
  const reservationId = String(formData.get("reservation_id") ?? "");
  if (!reservationId) {
    return { error: "No se encontró la reserva a eliminar." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", reservationId);

  if (error) {
    return { error: "No se pudo eliminar la reserva. Intenta de nuevo." };
  }

  revalidatePath("/");
  return { error: null, ok: true };
}
