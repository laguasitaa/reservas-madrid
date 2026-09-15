"use client";

import { useMemo, useState } from "react";
import { Plus, LogOut, CalendarX2 } from "lucide-react";
import { signOut } from "./login/actions";
import NewReservationSheet from "./NewReservationSheet";
import type { Apartment } from "@/lib/apartments";

export type Reservation = {
  id: string;
  apartment_id: string;
  start_date: string;
  end_date: string;
  amount: number | null;
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatAmount(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

export default function HomeClient({
  apartments,
  reservations,
}: {
  apartments: Apartment[];
  reservations: Reservation[];
}) {
  const [selectedId, setSelectedId] = useState(apartments[0]?.id ?? "");
  const [sheetOpen, setSheetOpen] = useState(false);

  const selected = apartments.find((a) => a.id === selectedId);

  const apartmentReservations = useMemo(
    () =>
      reservations
        .filter((r) => r.apartment_id === selectedId)
        .sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [reservations, selectedId]
  );

  const now = new Date();
  const thisMonthTotal = useMemo(() => {
    return apartmentReservations
      .filter((r) => {
        const d = new Date(r.start_date);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      })
      .reduce((sum, r) => sum + (r.amount ?? 0), 0);
  }, [apartmentReservations, now]);

  return (
    <div className="app-shell has-bottom-nav">
      <header className="app-header">
        <h1 className="font-display text-base flex-1">Reservas Madrid</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="icon-btn"
            data-plain="true"
            aria-label="Salir"
          >
            <LogOut className="icon" />
          </button>
        </form>
      </header>

      <div className="page">
        <div className="tabs" role="tablist">
          {apartments.map((apt) => (
            <button
              key={apt.id}
              type="button"
              role="tab"
              className="tab"
              aria-selected={apt.id === selectedId}
              onClick={() => setSelectedId(apt.id)}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle"
                style={{ backgroundColor: apt.color }}
              />
              {apt.name}
            </button>
          ))}
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-muted text-sm">Ganancias este mes</p>
            <p className="font-display text-xl num">
              {formatAmount(thisMonthTotal)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {apartmentReservations.length === 0 ? (
            <div className="empty-state">
              <CalendarX2 className="icon" style={{ width: 28, height: 28 }} />
              <p className="text-default font-medium">
                Sin reservas todavía.
              </p>
              <p className="text-muted text-sm">
                Toca + para agregar la primera.
              </p>
            </div>
          ) : (
            apartmentReservations.map((r) => (
              <div key={r.id} className="list-row">
                <div className="list-row-main">
                  <span className="list-row-title">
                    {formatDate(r.start_date)} — {formatDate(r.end_date)}
                  </span>
                  <span className="list-row-meta">
                    {r.amount != null ? formatAmount(r.amount) : "Sin monto"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button
        type="button"
        className="btn-primary fixed bottom-20 right-4 md:bottom-6 rounded-full w-14 h-14 grid place-items-center shadow-lg"
        aria-label="Nueva reserva"
        onClick={() => setSheetOpen(true)}
        disabled={!selected}
      >
        <Plus className="icon" />
      </button>

      {sheetOpen && selected ? (
        <NewReservationSheet
          apartment={selected}
          onClose={() => setSheetOpen(false)}
        />
      ) : null}
    </div>
  );
}
