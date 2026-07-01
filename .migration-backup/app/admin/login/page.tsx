"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const params = useSearchParams();
  const from = params.get("from") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Incorrect password");
      window.location.assign(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-line bg-white p-7 shadow-sm">
      <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-teal">Agility Engineers</p>
      <h1 className="mt-2 font-display text-2xl font-extrabold text-navy">Page admin</h1>
      <label className="mt-6 block text-sm font-semibold text-muted">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        className="mt-2 w-full rounded-lg border border-line px-3 py-3 text-ink outline-none focus:border-teal"
        placeholder="••••••••"
      />
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="ae-cta mt-5 w-full rounded-[10px] bg-cta px-4 py-3 font-display font-bold text-white disabled:opacity-70"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
