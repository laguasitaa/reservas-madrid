"use client";

import { useActionState, useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import {
  createReservation,
  updateReservation,
  deleteReservation,
  type ReservationState,
} from "./reservations/actions";
import type { Apartment } from "@/lib/apartments";
import type { Reservation } from "./HomeClient";

const initialState: ReservationState = { error: null };

export default function NewReservationSheet({
  apartments,
  defaultApartmentId,
  defaultDate,
  editing,
  onClose,
}: {
  apartments: Apartment[];
  defaultApartmentId?: string;
  defaultDate?: string | null;
  editing?: Reservation;
  onClose: () => void;
}) {
  const isEditing = Boolean(editing);
  const action = isEditing ? updateReservation : createReservation;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [apartmentId, setApartmentId] = useState(
    editing?.apartment_id ?? defaultApartmentId ?? apartments[0]?.id ?? ""
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteReservation,
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      onClose();
    }
  }, [state.ok, onClose]);

  useEffect(() => {
    if (deleteState.ok) {
      onClose();
    }
  }, [deleteState.ok, onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">
            {isEditing ? "Editar reserva" : "Nueva reserva"}
          </h2>
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
          {isEditing ? (
            <input type="hidden" name="reservation_id" value={editing!.id} />
          ) : null}

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

          <div className="flex flex-col gap-1">
            <label className="label-default" htmlFor="guest_name">
              Huésped (opcional)
            </label>
            <input
              id="guest_name"
              name="guest_name"
              type="text"
              maxLength={120}
              defaultValue={editing?.guest_name ?? ""}
              className="input-default"
              placeholder="Nombre del huésped"
            />
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
                defaultValue={editing?.start_date ?? defaultDate ?? undefined}
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
                defaultValue={editing?.end_date ?? undefined}
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
              defaultValue={editing?.amount ?? ""}
              className="input-default"
              placeholder="0.00"
            />
          </div>

          {state.error ? <p className="error-text">{state.error}</p> : null}

          <div className="modal-actions">
            {isEditing && !confirmingDelete ? (
              <button
                type="button"
                className="btn-danger"
                onClick={() => setConfirmingDelete(true)}
              >
                <Trash2 className="icon" style={{ width: 16, height: 16 }} />
              </button>
            ) : null}
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

        {isEditing && confirmingDelete ? (
          <form
            action={deleteAction}
            className="flex flex-col gap-2 pt-2 border-t border-default"
          >
            <input type="hidden" name="reservation_id" value={editing!.id} />
            <p className="error-text">
              ¿Eliminar esta reserva? No se puede deshacer.
            </p>
            {deleteState.error ? (
              <p className="error-text">{deleteState.error}</p>
            ) : null}
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmingDelete(false)}
              >
                No, cancelar
              </button>
              <button
                type="submit"
                className="btn-danger"
                disabled={deletePending}
                data-loading={deletePending}
              >
                {deletePending ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
