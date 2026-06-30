import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

type GenerateMetadataProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: GenerateMetadataProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "insights" });
  return buildMetadata({
    locale,
    path: "/insights/podcasts",
    title: t("tabs.podcasts") || "Podcasts",
    description: t("tabs.subtitle") || "Stay updated with the latest insights.",
  });
}
import { getPodcastsPaginatedCached } from "@/strapi/insights";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SearchFilterControls } from "@/components/insights/search-filter-controls";
import { PodcastsGrid } from "@/components/insights/podcasts-grid";
import { getMe } from "@/lib/actions/auth";
import { getSavedInsightIdsAction } from "@/lib/actions/saved-insights";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const sp = await searchParams;
  const page = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const current_page = isNaN(page) || page < 1 ? 1 : page;

  const searchQuery = typeof sp.q === 'string' ? sp.q : undefined;
  const sortOrder = sp.sort === 'oldest' ? 'oldest' : 'newest';

  const { data: podcasts, meta } = await getPodcastsPaginatedCached(locale, current_page, 9, searchQuery, sortOrder);
  const t = await getTranslations({ locale, namespace: 'insights' });

  const [session, savedIds] = await Promise.all([
    getMe(),
    getSavedInsightIdsAction(),
  ]);

  return (
    <main className="container py-24 mx-auto px-4 max-w-7xl">
      <div className="mb-12 border-b border-border/50 pb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{t('tabs.podcasts')}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t('tabs.subtitle')}</p>
      </div>

      <SearchFilterControls
        searchQuery={searchQuery || ""}
        sortOrder={sortOrder}
        showCategoryFilter={false}
      />

      <div className="mt-8">
        <PodcastsGrid
          podcasts={podcasts}
          locale={locale}
          savedIds={savedIds}
          isLoggedIn={!!session}
        />
      </div>

      <div className="mt-12">
        <PaginationControls pageCount={meta.pagination.pageCount} currentPage={meta.pagination.page} />
      </div>
    </main>
  );
}
