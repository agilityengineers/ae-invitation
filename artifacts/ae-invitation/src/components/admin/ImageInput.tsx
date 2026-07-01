"use client";

import { useRef, useState } from "react";

/** URL + S3 upload + AI image generation, all writing back a single image URL. */
export function ImageInput({
  label,
  slug,
  value,
  onChange,
}: {
  label: string;
  slug: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"" | "upload" | "ai">("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy("upload");
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy("");
    }
  }

  async function generate() {
    if (!prompt.trim()) return setError("Describe the image first.");
    setBusy("ai");
    setError("");
    try {
      const res = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Generation failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="rounded-xl border border-line p-3">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-teal">{label}</span>
      <input className="ae-input" value={value} placeholder="https://… or generate / upload below" onChange={(e) => onChange(e.target.value)} />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy !== ""} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy disabled:opacity-50">
          {busy === "upload" ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
        <input className="ae-input flex-1" value={prompt} placeholder="Describe an image to generate (AI)" onChange={(e) => setPrompt(e.target.value)} style={{ minWidth: 160 }} />
        <button type="button" onClick={generate} disabled={busy !== ""} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy disabled:opacity-50">
          {busy === "ai" ? "Generating…" : "Generate"}
        </button>
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-2 max-h-32 rounded-lg border border-line object-cover" />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
