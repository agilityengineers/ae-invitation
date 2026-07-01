import { Link } from "wouter";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center font-body text-ink">
      <p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-teal">404</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-navy">Page not found</h1>
      <p className="mt-4 text-muted-2">
        This landing page doesn&apos;t exist or hasn&apos;t been published yet.
      </p>
      <p className="mt-8">
        <Link href="/" className="text-teal underline">
          Back home
        </Link>
      </p>
    </main>
  );
}
