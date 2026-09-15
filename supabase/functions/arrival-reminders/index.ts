// Corre todos los días (disparada por pg_cron). Busca reservas que
// empiezan en 3 días y manda un correo de aviso al dueño por cada una.
import { createClient } from "jsr:@supabase/supabase-js@2";

const DAYS_BEFORE = 3;

function targetDateISO(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + DAYS_BEFORE);
  return d.toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  const [y, m, day] = iso.split("-");
  return `${day}/${m}/${y}`;
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const targetDate = targetDateISO();

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select("id, owner_id, guest_name, start_date, end_date, apartments(name)")
    .eq("start_date", targetDate);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  if (!reservations || reservations.length === 0) {
    return new Response(JSON.stringify({ sent: 0, targetDate }), {
      status: 200,
    });
  }

  const byOwner = new Map<string, typeof reservations>();
  for (const r of reservations) {
    const list = byOwner.get(r.owner_id) ?? [];
    list.push(r);
    byOwner.set(r.owner_id, list);
  }

  let sent = 0;
  const errors: string[] = [];

  for (const [ownerId, ownerReservations] of byOwner) {
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(ownerId);

    if (userError || !userData?.user?.email) {
      errors.push(`Sin correo para owner ${ownerId}`);
      continue;
    }

    const rows = ownerReservations
      .map((r) => {
        const apartmentName =
          (r.apartments as unknown as { name: string } | null)?.name ??
          "Apartamento";
        const guest = r.guest_name ? ` — ${r.guest_name}` : "";
        return `<li>${apartmentName}${guest}: llega ${formatDate(
          r.start_date
        )}, sale ${formatDate(r.end_date)}</li>`;
      })
      .join("");

    const html = `
      <p>Estas reservas llegan en ${DAYS_BEFORE} días (${formatDate(
      targetDate
    )}):</p>
      <ul>${rows}</ul>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: userData.user.email,
        subject: `Llegada${
          ownerReservations.length > 1 ? "s" : ""
        } en ${DAYS_BEFORE} días — Reservas Madrid`,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const body = await resendResponse.text();
      errors.push(`Resend error para ${userData.user.email}: ${body}`);
      continue;
    }

    sent++;
  }

  return new Response(JSON.stringify({ sent, targetDate, errors }), {
    status: 200,
  });
});
