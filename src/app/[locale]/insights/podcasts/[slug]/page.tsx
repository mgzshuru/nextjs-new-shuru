import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { getPodcastBySlugCached } from "@/strapi/insights";
import Image from "next/image";
import { ArticleLayout } from "@/components/insights/article-layout";
import { RichTextBlock } from "@/components/shared/rich-text-block";
import { getMe } from "@/lib/actions/auth";
import { isInsightSavedAction } from "@/lib/actions/saved-insights";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const podcast = await getPodcastBySlugCached(slug, locale);

  if (!podcast) {
    return { title: "Not Found" };
  }

  return {
    title: podcast.seo?.meta_title || podcast.title,
    description: podcast.seo?.meta_description || podcast.description || undefined,
  };
}

export default async function PodcastPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const podcast = await getPodcastBySlugCached(slug, locale);
  if (!podcast) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shuru.sa';
  const pageUrl = `${baseUrl}/${locale}/insights/podcasts/${podcast.slug}`;

  const blocks = podcast.content ? [{ __component: "shared.rich-text" as const, id: 1, body: podcast.content }] : [];

  const [session, isSaved] = await Promise.all([
    getMe(),
    isInsightSavedAction(podcast.documentId, 'podcast'),
  ]);

  return (
    <div className="flex-1 pb-16 lg:pb-24">
      {/* Podcast Header */}
      <section className="container mx-auto px-4 py-8 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {locale === 'ar' ? 'بودكاست' : 'Podcast'}
            </span>
            {podcast.podcast_date && (
              <span className="text-sm text-neutral-500">
                {new Date(podcast.podcast_date).toLocaleDateString(locale)}
              </span>
            )}
            {podcast.duration && (
              <span className="text-sm text-neutral-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {podcast.duration}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">{podcast.title}</h1>

          {/* Media Player (Video or Image fallback) */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-12 bg-black shadow-xl">
            {podcast.video_url ? (
              <iframe
                src={podcast.video_url}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : podcast.video_file?.url ? (
              <video
                src={podcast.video_file.url}
                controls
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                poster={podcast.cover_image?.url || undefined}
              />
            ) : podcast.cover_image?.url ? (
              <Image
                src={podcast.cover_image.url}
                alt={podcast.title}
                fill
                className="object-cover opacity-80"
                priority
              />
            ) : null}
          </div>

          {/* Audio Player if provided separately */}
          {podcast.audio_url && (
            <div className="mb-12 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <p className="text-sm font-bold text-neutral-700 mb-2">{locale === 'ar' ? 'استمع للحلقة' : 'Listen to episode'}</p>
              <audio src={podcast.audio_url} controls className="w-full" />
            </div>
          )}
        </div>
      </section>

      {/* Podcast Content & Layout */}
      <ArticleLayout
        shareUrl={pageUrl}
        shareTitle={podcast.title}
        insightId={podcast.documentId}
        insightType="podcast"
        isLoggedIn={!!session}
        initialIsSaved={isSaved}
        locale={locale}
      >
        {blocks.length > 0 && (
          <div className="mb-12">
            {blocks.map((block) => (
              <RichTextBlock key={block.id} block={block} />
            ))}
          </div>
        )}

        {/* Guests Section */}
        {podcast.guests && podcast.guests.length > 0 && (
          <div className="mt-12 px-4 max-w-3xl mx-auto w-full">
            <h3 className="text-2xl font-bold mb-6">{locale === 'ar' ? 'الضيوف' : 'Guests'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {podcast.guests.map(guest => (
                <div key={guest.id} className="flex items-center gap-4 p-4 border border-neutral-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full shrink-0 flex items-center justify-center text-neutral-400">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-neutral-900">{guest.name}</h4>
                    {guest.title && <p className="text-sm text-primary font-medium mt-0.5">{guest.title}</p>}
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