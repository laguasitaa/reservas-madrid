"use client";

import { useActionState, useEffect, useState } from "react";
import { X } from "lucide-react";
import { createReservation, type ReservationState } from "./reservations/actions";
import type { Apartment } from "@/lib/apartments";

const initialState: ReservationState = { error: null };

export default function NewReservationSheet({
  apartments,
  defaultApartmentId,
  defaultDate,
  onClose,
}: {
  apartments: Apartment[];
  defaultApartmentId?: string;
  defaultDate?: string | null;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    createReservation,
    initialState
  );
  const [apartmentId, setApartmentId] = useState(
    defaultApartmentId ?? apartments[0]?.id ?? ""
  );

  useEffect(() => {
    if (state.ok) {
      onClose();
    }
  }, [state.ok, onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">Nueva reserva</h2>
          <button
            type="button"
            className="icon-btn"
            data-plain="true"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X className="icon" />
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="label-default" htmlFor="apartment_id">
              Apartamento
            </label>
            <select
              id="apartment_id"
              name="apartment_id"
              required
              className="input-default"
              value={apartmentId}
              onChange={(e) => setApartmentId(e.target.value)}
            >
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="label-default" htmlFor="start_date">
                Llegada
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                required
                defaultValue={defaultDate ?? undefined}
                className="input-default"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="label-default" htmlFor="end_date">
                Salida
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                required
                className="input-default"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-default" htmlFor="amount">
              Monto total (opcional)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              className="input-default"
              placeholder="0.00"
            />
          </div>

          {state.error ? <p className="error-text">{state.error}</p> : null}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={pending}
              data-loading={pending}
            >
              {pending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
