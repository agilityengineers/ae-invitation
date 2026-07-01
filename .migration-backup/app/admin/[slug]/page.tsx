import { notFound } from "next/navigation";
import { getVariant } from "@/lib/config";
import { availableProviders } from "@/lib/ai";
import { EditForm } from "@/components/admin/EditForm";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ generated?: string }>;
}) {
  const { slug } = await params;
  const { generated } = await searchParams;
  const variant = await getVariant(slug).catch(() => null);
  if (!variant) notFound();

  return <EditForm initial={variant} providers={availableProviders()} generated={generated === "1"} />;
}
