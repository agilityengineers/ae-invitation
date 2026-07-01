"use client";

import { Fragment } from "react";

/**
 * Schema-free recursive field editor — renders an input for every leaf of a
 * plain-JSON value, so the admin can edit ALL copy without a hand-written form
 * per field. Ported from Content-Authority's components/admin/fields.tsx.
 */

export type Path = (string | number)[];

const LONG_FIELDS = /(headline|subhead|body|description|quote|paragraph|tagline|answer|a|credentials|caseStudy|footnote)/i;
const LABEL_MAP: Record<string, string> = {
  q: "Question",
  a: "Answer",
  cta: "CTA",
  ctaLabel: "CTA label",
  ogTitle: "OG title",
  ogDescription: "OG description",
  ogImage: "OG image",
  num: "Number",
  imageUrl: "Image URL",
  imageAlt: "Image alt",
  videoUrl: "Video URL",
};

function humanize(key: string | number): string {
  if (typeof key === "number") return `#${key + 1}`;
  if (LABEL_MAP[key]) return LABEL_MAP[key];
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function setByPath<T>(obj: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  if (Array.isArray(obj)) {
    const copy = [...obj];
    copy[head as number] = setByPath(copy[head as number], rest, value);
    return copy as T;
  }
  const copy = { ...(obj as Record<string, unknown>) };
  copy[head as string] = setByPath(copy[head as string], rest, value);
  return copy as T;
}

function LeafField({
  name,
  value,
  onChange,
}: {
  name: string | number;
  value: string | number | boolean;
  onChange: (v: string | number | boolean) => void;
}) {
  const label = humanize(name);
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center justify-between gap-3 py-1.5 text-sm font-medium text-ink">
        <span>{label}</span>
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#2E8B57]" />
      </label>
    );
  }
  if (typeof value === "number") {
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="ae-input" />
      </label>
    );
  }
  const long = String(value).length > 70 || (typeof name === "string" && LONG_FIELDS.test(name));
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      {long ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="ae-textarea" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="ae-input" />
      )}
    </label>
  );
}

export function FieldNode({
  name,
  value,
  path,
  onChange,
  depth = 0,
  omit,
}: {
  name?: string | number;
  value: unknown;
  path: Path;
  onChange: (path: Path, value: unknown) => void;
  depth?: number;
  omit?: (path: Path) => boolean;
}) {
  if (value === null || value === undefined) return null;

  if (Array.isArray(value)) {
    return (
      <fieldset className="mt-3 rounded-xl border border-line p-3">
        {name !== undefined && <legend className="px-1 text-xs font-bold uppercase tracking-wide text-teal">{humanize(name)}</legend>}
        <div className="grid gap-3">
          {value.map((item, i) => (
            <FieldNode key={i} name={i} value={item} path={[...path, i]} onChange={onChange} depth={depth + 1} omit={omit} />
          ))}
        </div>
      </fieldset>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([k]) => !omit?.([...path, k]));
    return (
      <fieldset className={depth === 0 ? "" : "mt-3 rounded-xl border border-line p-3"}>
        {name !== undefined && depth > 0 && (
          <legend className="px-1 text-xs font-bold uppercase tracking-wide text-teal">{humanize(name)}</legend>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map(([k, v]) => {
            const isContainer = v !== null && typeof v === "object";
            return (
              <div key={k} className={isContainer ? "sm:col-span-2" : ""}>
                <FieldNode name={k} value={v} path={[...path, k]} onChange={onChange} depth={depth + 1} omit={omit} />
              </div>
            );
          })}
        </div>
      </fieldset>
    );
  }

  return (
    <Fragment>
      <LeafField name={name ?? ""} value={value as string | number | boolean} onChange={(v) => onChange(path, v)} />
    </Fragment>
  );
}
