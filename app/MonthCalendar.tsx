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
                className="border-r border-b border-default bg-app min-h-14 sm:min-h-16"
              />
            );
          }
          const iso = toISODate(year, monthIndex, day);
          const occupiedApts = apartmentsOnDate(iso, apartments, reservations);
          const isSelected = iso === selectedDate;
          const isToday = iso === todayISO;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              className="relative flex flex-col items-stretch border-r border-b border-default min-h-14 sm:min-h-16 p-1 gap-1 text-left transition-colors"
              style={{
                backgroundColor: isSelected
                  ? "var(--c-accent-ring)"
                  : "var(--c-surface)",
              }}
            >
              <span
                className="text-xs num self-start rounded-full w-5 h-5 flex items-center justify-center"
                style={{
                  backgroundColor: isToday ? "var(--c-accent)" : "transparent",
                  color: isToday ? "var(--c-on-accent)" : "var(--c-text)",
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {day}
              </span>
              <span className="flex flex-col gap-0.5">
                {occupiedApts.slice(0, 3).map((a) => (
                  <span
                    key={a.id}
                    className="h-1.5 rounded-sm"
                    style={{ backgroundColor: a.color }}
                  />
                ))}
                {occupiedApts.length > 3 ? (
                  <span className="text-[10px] text-muted leading-none">
                    +{occupiedApts.length - 3}
                  </span>
                ) : null}
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
