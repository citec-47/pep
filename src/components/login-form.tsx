"use client";

import { useActionState } from "react";

type ActionState = { error?: string } | undefined;
type FormAction = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function LoginForm({ action }: { action: FormAction }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block">
        <span className="label">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          className="field"
        />
      </label>

      <label className="block">
        <span className="label">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field"
        />
      </label>

      {state?.error && (
        <p className="rounded-lg bg-alert-soft px-3 py-2 text-sm text-alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-deep disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
