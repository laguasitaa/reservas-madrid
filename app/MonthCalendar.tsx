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

function apartmentsOnDate(
  date: string,
  apartments: Apartment[],
  reservations: Reservation[]
) {
  const occupied = new Set(
    reservations
      .filter((r) => r.start_date <= date && date < r.end_date)
      .map((r) => r.apartment_id)
  );
  return apartments.filter((a) => occupied.has(a.id));
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

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-muted text-xs font-medium py-1">
            {d}
          </span>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} />;
          const iso = toISODate(year, monthIndex, day);
          const occupiedApts = apartmentsOnDate(iso, apartments, reservations);
          const isSelected = iso === selectedDate;
          const isToday = iso === todayISO;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              className="relative flex flex-col items-center justify-center rounded-md min-h-11 overflow-hidden transition-colors"
              style={{
                outline: isToday ? "2px solid var(--c-accent)" : "none",
                outlineOffset: -1,
              }}
            >
              {occupiedApts.length > 0 ? (
                <span className="absolute inset-0.5 rounded-sm flex overflow-hidden">
                  {occupiedApts.slice(0, 4).map((a) => (
                    <span
                      key={a.id}
                      className="flex-1 h-full"
                      style={{ backgroundColor: a.color, opacity: 0.32 }}
                    />
                  ))}
                </span>
              ) : null}
              <span
                className="relative z-10 text-sm num rounded-full px-1.5"
                style={{
                  backgroundColor: isSelected
                    ? "var(--c-accent-ring)"
                    : "transparent",
                }}
              >
                {day}
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
