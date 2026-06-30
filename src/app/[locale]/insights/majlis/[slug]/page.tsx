import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { getMajlisBySlugCached } from "@/strapi/insights";
import Image from "next/image";
import { ArticleLayout } from "@/components/insights/article-layout";
import { RichTextBlock } from "@/components/shared/rich-text-block";
import { getMe } from "@/lib/actions/auth";
import { isInsightSavedAction } from "@/lib/actions/saved-insights";
import { buildMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const majlis = await getMajlisBySlugCached(slug, locale);

  if (!majlis) {
    return { title: "Not Found" };
  }

  const seo = majlis.seo;
  const ogImg = (majlis.cover_image || seo?.og_image) as any;

  return buildMetadata({
    locale,
    path: `/insights/majlis/${slug}`,
    title: seo?.meta_title || majlis.title,
    description: seo?.meta_description || majlis.description || undefined,
    keywords: seo?.meta_keywords ? seo.meta_keywords.split(",").map((k) => k.trim()) : undefined,
    ogImage: ogImg ? {
      url: ogImg.url,
      width: ogImg.width,
      height: ogImg.height,
      alt: ogImg.alternativeText,
    } : undefined,
    type: "article",
  });
}

export default async function MajlisPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const majlis = await getMajlisBySlugCached(slug, locale);
  if (!majlis) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shuru.sa';
  const pageUrl = `${baseUrl}/${locale}/insights/majlis/${majlis.slug}`;

  // Create blocks array for RichTextBlock from 'content' using a dummy ID
  const blocks = majlis.content ? [{ __component: "shared.rich-text" as const, id: 1, body: majlis.content }] : [];

  const [session, isSaved] = await Promise.all([
    getMe(),
    isInsightSavedAction(majlis.documentId, 'majlis'),
  ]);

  return (
    <div className="flex-1 pb-16 lg:pb-24">
      {/* Majlis Header */}
      <section className="container mx-auto px-4 py-8 lg:py-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{majlis.title}</h1>
        {majlis.majlis_date && (
          <p className="text-sm text-neutral-500 mb-8">
            {new Date(majlis.majlis_date).toLocaleDateString(locale)}
          </p>
        )}

        {majlis.cover_image?.url && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-12 bg-neutral-100">
            <Image
              src={majlis.cover_image.url}
              alt={majlis.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </section>

      {/* Majlis Content & Layout */}
      <ArticleLayout
        shareUrl={pageUrl}
        shareTitle={majlis.title}
        insightId={majlis.documentId}
        insightType="majlis"
        isLoggedIn={!!session}
        initialIsSaved={isSaved}
        locale={locale}
      >
        {blocks.map((block) => (
          <RichTextBlock key={block.id} block={block} />
        ))}

        {/* Guests Section */}
        {majlis.guests && majlis.guests.length > 0 && (
          <div className="mt-12 px-4 max-w-3xl mx-auto w-full">
            <h3 className="text-2xl font-bold mb-6">{locale === 'ar' ? 'الضيوف' : 'Guests'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {majlis.guests.map(guest => (
                <div key={guest.id} className="flex items-center gap-4 p-4 border rounded-xl bg-white shadow-sm">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full shrink-0 flex items-center justify-center text-neutral-400">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{guest.name}</h4>
                    {guest.title && <p className="text-sm text-neutral-600">{guest.title}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ArticleLayout>
    </div>
  );
}