"use client";

import { useMemo } from "react";
import type { Apartment } from "@/lib/apartments";
import type { Reservation } from "./HomeClient";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatAmount(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

export default function SummaryView({
  apartments,
  reservations,
  onSelectReservation,
}: {
  apartments: Apartment[];
  reservations: Reservation[];
  onSelectReservation: (reservation: Reservation) => void;
}) {
  const byApartment = useMemo(() => {
    return apartments.map((a) => {
      const own = reservations.filter((r) => r.apartment_id === a.id);
      const total = own.reduce((sum, r) => sum + (r.amount ?? 0), 0);
      return { apartment: a, count: own.length, total };
    });
  }, [apartments, reservations]);

  const grandTotal = byApartment.reduce((sum, a) => sum + a.total, 0);

  const allReservations = useMemo(
    () =>
      reservations
        .map((r) => ({
          ...r,
          apartment: apartments.find((a) => a.id === r.apartment_id),
        }))
        .sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [reservations, apartments]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <p className="text-muted text-sm">Ganancias totales</p>
        <p className="font-display text-2xl num">{formatAmount(grandTotal)}</p>
      </div>

      <div className="flex flex-col gap-2">
        {byApartment.map(({ apartment, count, total }) => (
          <div key={apartment.id} className="list-row">
            <div className="list-row-main">
              <span className="list-row-title">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle"
                  style={{ backgroundColor: apartment.color }}
                />
                {apartment.name}
              </span>
              <span className="list-row-meta">
                {count} {count === 1 ? "reserva" : "reservas"}
              </span>
            </div>
            <span className="font-display text-base num">
              {formatAmount(total)}
            </span>
          </div>
        ))}
      </div>

      <div>
        <p className="text-muted text-sm mb-2">Todas las reservas</p>
        <div className="flex flex-col gap-2">
          {allReservations.length === 0 ? (
            <div className="empty-state">
              <p className="text-default text-sm">Sin reservas todavía.</p>
            </div>
          ) : (
            allReservations.map((r) => (
              <button
                key={r.id}
                type="button"
                className="list-row text-left w-full"
                onClick={() => onSelectReservation(r)}
              >
                <div className="list-row-main">
                  <span className="list-row-title">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle"
                      style={{ backgroundColor: r.apartment?.color }}
                    />
                    {r.apartment?.name}
                    {r.guest_name ? ` — ${r.guest_name}` : ""}
                  </span>
                  <span className="list-row-meta">
                    {formatDate(r.start_date)} — {formatDate(r.end_date)}
                  </span>
                </div>
                <span className="num text-sm">
                  {r.amount != null ? formatAmount(r.amount) : "—"}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
