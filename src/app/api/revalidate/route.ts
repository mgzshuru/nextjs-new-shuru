import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { GLOBAL_SETTINGS_TAG } from "@/strapi/global";
import { HEADER_SETTINGS_TAG } from "@/strapi/header";
import { FOOTER_SETTINGS_TAG } from "@/strapi/footer";
import { HOME_TAG, TESTIMONIALS_TAG } from "@/strapi/home";
import { PAGE_TAG } from "@/strapi/page";

type RevalidateBody = {
  model?: string;
};

const MODEL_TO_TAGS: Record<string, string|null> = {
  global: GLOBAL_SETTINGS_TAG,
  about: "about",
  article: "articles",
  author: "author",
  category: "categories",
  footer: FOOTER_SETTINGS_TAG,
  header: HEADER_SETTINGS_TAG,
  home: HOME_TAG,
  testimonial: TESTIMONIALS_TAG,
  page: PAGE_TAG,
  none: null,
};

export async function POST(request: Request) {
  const expectedSecret = process.env.STRAPI_REVALIDATE_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Missing STRAPI_REVALIDATE_SECRET on server" },
      { status: 500 }
    );
  }

  const providedSecret = request.headers.get("x-revalidate-secret");
  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: RevalidateBody = {};
  try {
    payload = (await request.json()) as RevalidateBody;
  } catch {
    payload = {};
  }

  console.log("Revalidation request received with payload:", payload);

  const requestedModel =
    typeof payload.model === "string" && payload.model.trim().length > 0
      ? payload.model.trim().toLowerCase()
      : "none";

  if (requestedModel === 'all') {
    revalidatePath('/', 'layout');
    return NextResponse.json({
      revalidated: true,
      model: 'all',
      message: 'Revalidated all pages',
    });
  }

  const tag = MODEL_TO_TAGS[requestedModel];
  if (!tag) {
    return NextResponse.json(
      {
        revalidated: false,
        skipped: true,
        model: requestedModel,
        message: "No matching tag for the provided model. No revalidation performed.",
      },
      { status: 400 }
    );
  }

  revalidateTag(tag, "max");

  return NextResponse.json({
    revalidated: true,
    model: requestedModel,
    tag,
  });
}
