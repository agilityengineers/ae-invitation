import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/csrf";
import { variantSchema, slugSchema, templateTypeSchema } from "@/config/schema";
import { defaultForTemplate } from "@/config/defaults";
import {
  listVariants,
  getVariant,
  saveVariant,
  setPublished,
  deleteVariant,
  slugExists,
} from "@/lib/config";

async function requireAuth() {
  return isAuthenticated();
}

/** GET — list all variants (admin). */
export async function GET() {
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ variants: await listVariants() });
}

/** PATCH — save a full variant config (admin edit). */
export async function PATCH(req: NextRequest) {
  if (!requireSameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = variantSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid config", issues: parsed.error.issues }, { status: 400 });
  }
  const saved = await saveVariant(parsed.data);
  revalidatePath(`/${saved.slug}`);
  revalidatePath("/");
  return NextResponse.json({ variant: saved });
}

/** PUT — create a new variant from the template default (manual, no AI). */
const createSchema = z.object({
  templateType: templateTypeSchema,
  slug: slugSchema,
  label: z.string().min(1),
});
export async function PUT(req: NextRequest) {
  if (!requireSameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }
  if (await slugExists(parsed.data.slug)) {
    return NextResponse.json({ error: "A variant with that slug already exists." }, { status: 409 });
  }
  const base = defaultForTemplate(parsed.data.templateType);
  const saved = await saveVariant({
    ...base,
    templateType: parsed.data.templateType,
    slug: parsed.data.slug,
    label: parsed.data.label,
    published: false,
  });
  return NextResponse.json({ variant: saved });
}

/** POST — publish / unpublish / delete a variant. */
const actionSchema = z.object({
  slug: z.string(),
  action: z.enum(["publish", "unpublish", "delete"]),
});
export async function POST(req: NextRequest) {
  if (!requireSameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!(await requireAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = actionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }
  const { slug, action } = parsed.data;

  if (action === "delete") {
    await deleteVariant(slug);
    revalidatePath(`/${slug}`);
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  }

  if (!(await getVariant(slug))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const saved = await setPublished(slug, action === "publish");
  revalidatePath(`/${slug}`);
  revalidatePath("/");
  return NextResponse.json({ variant: saved });
}
