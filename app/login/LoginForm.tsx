"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "./actions";

const initialState: AuthState = { error: null };

export default function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="card p-6 w-full max-w-sm flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl">Reservas Madrid</h1>
        <p className="text-muted text-sm">
          {mode === "signin"
            ? "Entra con tu correo y contraseña."
            : "Crea tu cuenta con correo y contraseña."}
        </p>
      </div>

      <div className="segmented self-start" role="tablist">
        <button
          type="button"
          className="segment"
          aria-selected={mode === "signin"}
          onClick={() => setMode("signin")}
        >
          Entrar
        </button>
        <button
          type="button"
          className="segment"
          aria-selected={mode === "signup"}
          onClick={() => setMode("signup")}
        >
          Crear cuenta
        </button>
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="label-default" htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input-default"
            placeholder="tucorreo@ejemplo.com"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="label-default" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="input-default"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {state.error ? <p className="error-text">{state.error}</p> : null}

        <button
          type="submit"
          className="btn-primary mt-1"
          disabled={pending}
          data-loading={pending}
        >
          {pending
            ? "Un momento…"
            : mode === "signin"
              ? "Entrar"
              : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
