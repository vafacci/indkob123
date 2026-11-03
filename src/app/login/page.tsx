"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(login, null);

  const input =
    "h-14 rounded-2xl border border-slate-300 bg-white px-4 text-lg outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-3xl font-bold">🛒 Indkøbsliste</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Skriv dit navn og jeres fælles adgangskode.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <input name="name" required placeholder="Dit navn" autoComplete="given-name" className={input} />
        <input
          name="password"
          type="password"
          required
          placeholder="Adgangskode"
          autoComplete="current-password"
          className={input}
        />
        <button
          type="submit"
          disabled={pending}
          className="h-14 rounded-2xl bg-green-600 text-lg font-semibold text-white active:bg-green-700 disabled:opacity-60"
        >
          {pending ? "Logger ind…" : "Log ind"}
        </button>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </form>
    </main>
  );
}
