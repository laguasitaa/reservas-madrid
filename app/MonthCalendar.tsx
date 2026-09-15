"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Apartment } from "@/lib/apartments";
import type { Reservation } from "./HomeClient";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(year: number, monthIndex: number, day: number) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Lunes = 0 ... Domingo = 6
function startWeekday(year: number, monthIndex: number) {
  const jsDay = new Date(year, monthIndex, 1).getDay();
  return (jsDay + 6) % 7;
}

function reservationsOnDate(
  date: string,
  apartments: Apartment[],
  reservations: Reservation[]
) {
  return reservations
    .filter((r) => r.start_date <= date && date < r.end_date)
    .map((r) => ({
      ...r,
      apartment: apartments.find((a) => a.id === r.apartment_id),
    }))
    .filter((r) => r.apartment)
    .sort(
      (a, b) =>
        apartments.findIndex((x) => x.id === a.apartment_id) -
        apartments.findIndex((x) => x.id === b.apartment_id)
    );
}

export default function MonthCalendar({
  year,
  monthIndex,
  apartments,
  reservations,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: {
  year: number;
  monthIndex: number;
  apartments: Apartment[];
  reservations: Reservation[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const total = daysInMonth(year, monthIndex);
  const offset = startWeekday(year, monthIndex);
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayISO = toISODate(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );

  return (
    <div className="card p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="icon-btn"
          data-plain="true"
          aria-label="Mes anterior"
          onClick={onPrevMonth}
        >
          <ChevronLeft className="icon" />
        </button>
        <p className="font-display text-base capitalize">
          {MONTH_NAMES[monthIndex]} {year}
        </p>
        <button
          type="button"
          className="icon-btn"
          data-plain="true"
          aria-label="Mes siguiente"
          onClick={onNextMonth}
        >
          <ChevronRight className="icon" />
        </button>
      </div>

      <div
        className="grid grid-cols-7 border-t border-l border-default rounded-md overflow-hidden"
        style={{ borderColor: "var(--c-border)" }}
      >
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="text-muted text-xs font-medium text-center py-1.5 border-r border-b border-default bg-app"
          >
            {d}
          </span>
        ))}

        {cells.map((day, i) => {
          if (day === null) {
            return (
              <span
                key={`empty-${i}`}
                className="border-r border-b border-default bg-app min-h-24 sm:min-h-36"
              />
            );
          }
          const iso = toISODate(year, monthIndex, day);
          const dayReservations = reservationsOnDate(
            iso,
            apartments,
            reservations
          );
          const isSelected = iso === selectedDate;
          const isToday = iso === todayISO;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              className="relative flex flex-col items-stretch border-r border-b border-default min-h-24 sm:min-h-36 p-1 gap-1 text-left transition-colors"
              style={{
                backgroundColor: isSelected
                  ? "var(--c-accent-ring)"
                  : "var(--c-surface)",
              }}
            >
              <span
                className="text-sm num self-start rounded-full w-6 h-6 flex items-center justify-center"
                style={{
                  backgroundColor: isToday ? "var(--c-accent)" : "transparent",
                  color: isToday ? "var(--c-on-accent)" : "var(--c-text)",
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {day}
              </span>
              <span className="flex flex-col gap-1">
                {dayReservations.map((r) => (
                  <span
                    key={r.id}
                    className="rounded px-1 py-0.5 leading-tight text-[11px] sm:text-xs font-semibold truncate"
                    style={{
                      backgroundColor: r.apartment!.color,
                      color: "var(--c-on-accent)",
                    }}
                  >
                    {r.guest_name ?? r.apartment!.name}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-default">
        {apartments.map((a) => (
          <span
            key={a.id}
            className="text-xs text-muted flex items-center gap-1.5"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: a.color }}
            />
            {a.name}
          </span>
        ))}
      </div>
    </div>
  );
}
