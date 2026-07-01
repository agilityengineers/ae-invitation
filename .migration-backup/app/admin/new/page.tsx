import { availableProviders } from "@/lib/ai";
import { GeneratorForm } from "@/components/admin/GeneratorForm";

export const dynamic = "force-dynamic";

export default function NewPage() {
  const providers = availableProviders();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 font-display text-2xl font-extrabold text-navy">New page</h1>
      <p className="mb-6 text-muted">
        Generate a targeted page with AI (you pick the provider), or create a blank one from the
        template default to fill in by hand.
      </p>
      <GeneratorForm providers={providers} />
    </div>
  );
}
