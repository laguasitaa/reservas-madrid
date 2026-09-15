"use client";

import { useMemo, useState } from "react";
import { Plus, LogOut, CalendarX2 } from "lucide-react";
import { signOut } from "./login/actions";
import NewReservationSheet from "./NewReservationSheet";
import MonthCalendar from "./MonthCalendar";
import SummaryView from "./SummaryView";
import SpainFlag from "./SpainFlag";
import type { Apartment } from "@/lib/apartments";
import { nightsBetween, pricePerNight } from "@/lib/nights";

export type Reservation = {
  id: string;
  apartment_id: string;
  start_date: string;
  end_date: string;
  amount: number | null;
  guest_name: string | null;
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatAmount(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function stayMeta(r: Reservation) {
  const nights = nightsBetween(r.start_date, r.end_date);
  const perNight = pricePerNight(r.amount, nights);
  const nightsLabel = `${nights} ${nights === 1 ? "noche" : "noches"}`;
  const perNightLabel =
    perNight != null ? ` · ${formatAmount(perNight)}/noche` : "";
  return `${nightsLabel}${perNightLabel}`;
}

export default function HomeClient({
  apartments,
  reservations,
}: {
  apartments: Apartment[];
  reservations: Reservation[];
}) {
  const [view, setView] = useState<"calendar" | "agenda" | "summary">(
    "calendar"
  );
  const [selectedApartmentId, setSelectedApartmentId] = useState(
    apartments[0]?.id ?? ""
  );
  const [sheet, setSheet] = useState<
    { mode: "create" } | { mode: "edit"; reservation: Reservation } | null
  >(null);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedApartment = apartments.find((a) => a.id === selectedApartmentId);

  const apartmentReservations = useMemo(
    () =>
      reservations
        .filter((r) => r.apartment_id === selectedApartmentId)
        .sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [reservations, selectedApartmentId]
  );

  const thisMonthTotal = useMemo(() => {
    return apartmentReservations
      .filter((r) => {
        const d = new Date(r.start_date);
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth()
        );
      })
      .reduce((sum, r) => sum + (r.amount ?? 0), 0);
  }, [apartmentReservations, today]);

  const dayReservations = useMemo(() => {
    if (!selectedDate) return [];
    return reservations
      .filter((r) => r.start_date <= selectedDate && selectedDate < r.end_date)
      .map((r) => ({
        ...r,
        apartment: apartments.find((a) => a.id === r.apartment_id),
      }));
  }, [reservations, selectedDate, apartments]);

  function goPrevMonth() {
    setSelectedDate(null);
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    setSelectedDate(null);
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  }

  return (
    <div className="app-shell has-bottom-nav">
      <header className="app-header">
        <SpainFlag className="w-5 h-auto flex-none" />
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
        <div className="segmented self-start" role="tablist">
          <button
            type="button"
            className="segment"
            aria-selected={view === "calendar"}
            onClick={() => setView("calendar")}
          >
            Calendario
          </button>
          <button
            type="button"
            className="segment"
            aria-selected={view === "agenda"}
            onClick={() => setView("agenda")}
          >
            Agenda
          </button>
          <button
            type="button"
            className="segment"
            aria-selected={view === "summary"}
            onClick={() => setView("summary")}
          >
            Resumen
          </button>
        </div>

        {view === "calendar" ? (
          <>
            <MonthCalendar
              year={calYear}
              monthIndex={calMonth}
              apartments={apartments}
              reservations={reservations}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onPrevMonth={goPrevMonth}
              onNextMonth={goNextMonth}
            />

            {selectedDate ? (
              <div className="flex flex-col gap-2">
                <p className="text-muted text-sm">
                  {formatDate(selectedDate)}
                </p>
                {dayReservations.length === 0 ? (
                  <div className="empty-state">
                    <CalendarX2
                      className="icon"
                      style={{ width: 24, height: 24 }}
                    />
                    <p className="text-default text-sm">
                      Ningún apartamento ocupado este día.
                    </p>
                  </div>
                ) : (
                  dayReservations.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="list-row text-left w-full"
                      onClick={() => setSheet({ mode: "edit", reservation: r })}
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
                          {" · "}
                          {stayMeta(r)}
                          {r.amount != null
                            ? ` · ${formatAmount(r.amount)}`
                            : ""}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </>
        ) : view === "summary" ? (
          <SummaryView
            apartments={apartments}
            reservations={reservations}
            onSelectReservation={(r) => setSheet({ mode: "edit", reservation: r })}
          />
        ) : (
          <>
            <div className="tabs" role="tablist">
              {apartments.map((apt) => (
                <button
                  key={apt.id}
                  type="button"
                  role="tab"
                  className="tab"
                  aria-selected={apt.id === selectedApartmentId}
                  onClick={() => setSelectedApartmentId(apt.id)}
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
                  <CalendarX2
                    className="icon"
                    style={{ width: 28, height: 28 }}
                  />
                  <p className="text-default font-medium">
                    Sin reservas todavía.
                  </p>
                  <p className="text-muted text-sm">
                    Toca + para agregar la primera.
                  </p>
                </div>
              ) : (
                apartmentReservations.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="list-row text-left w-full"
                    onClick={() => setSheet({ mode: "edit", reservation: r })}
                  >
                    <div className="list-row-main">
                      <span className="list-row-title">
                        {formatDate(r.start_date)} — {formatDate(r.end_date)}
                        {r.guest_name ? ` — ${r.guest_name}` : ""}
                      </span>
                      <span className="list-row-meta">
                        {stayMeta(r)} ·{" "}
                        {r.amount != null ? formatAmount(r.amount) : "Sin monto"}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        className="btn-primary fixed bottom-20 right-4 md:bottom-6 rounded-full w-14 h-14 grid place-items-center shadow-lg"
        aria-label="Nueva reserva"
        onClick={() => setSheet({ mode: "create" })}
        disabled={apartments.length === 0}
      >
        <Plus className="icon" />
      </button>

      {sheet ? (
        <NewReservationSheet
          apartments={apartments}
          editing={sheet.mode === "edit" ? sheet.reservation : undefined}
          defaultApartmentId={
            sheet.mode === "create" && view === "agenda"
              ? selectedApartment?.id
              : undefined
          }
          defaultDate={
            sheet.mode === "create" && view === "calendar" ? selectedDate : null
          }
          onClose={() => setSheet(null)}
        />
      ) : null}
    </div>
  );
}
