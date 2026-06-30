import {
  getArticlesPaginatedCached,
  getNewsPaginatedCached,
  getMagazineIssuesPaginatedCached,
  getMajlisPaginatedCached,
  getPodcastsPaginatedCached,
  getAuthorCached,
  getCategoriesForFilterCached,
} from "@/strapi/insights";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
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
    path: "/insights",
    title: t("title") || "Insights",
    description: t("tabs.subtitle") || "Stay updated with the latest insights.",
  });
}

import { InsightsContent } from "@/components/insights/insights-content";
import { getMe } from "@/lib/actions/auth";
import { getSavedInsightIdsAction } from "@/lib/actions/saved-insights";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ locale: Locale }>;
};

/**
 * Minimal page size for inactive tabs — enough to populate the tab but avoids
 * fetching data the user likely won't look at on this page load.
 */
const INACTIVE_PAGE_SIZE = 3;
const ACTIVE_PAGE_SIZE = 9;

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const sp = await searchParams;
  const tab = typeof sp.tab === 'string' ? sp.tab : 'articles';
  const page = typeof sp.page === 'string' ? parseInt(sp.page, 10) : 1;
  const current_page = isNaN(page) || page < 1 ? 1 : page;
  const authorId = typeof sp.author === 'string' ? sp.author : undefined;

  const searchQuery = typeof sp.q === 'string' ? sp.q : undefined;
  const categorySlug = typeof sp.category === 'string' ? sp.category : undefined;
  const sortOrder = sp.sort === 'oldest' ? 'oldest' : 'newest';

  // Only fetch the active tab at the current page with a full page size.
  // Inactive tabs get page 1 with a tiny page size — enough for a preview
  // and to return pagination.total for the tab count badge.
  const [
    session,
    savedIds,
    author,
    articlesData,
    newsData,
    magazinesData,
    majlisesData,
    podcastsData,
    categories,
  ] = await Promise.all([
    getMe(),
    getSavedInsightIdsAction(),
    authorId ? getAuthorCached(authorId, locale) : Promise.resolve(null),
    getArticlesPaginatedCached(
      locale,
      tab === 'articles' ? current_page : 1,
      tab === 'articles' ? ACTIVE_PAGE_SIZE : INACTIVE_PAGE_SIZE,
      authorId,
      tab === 'articles' ? searchQuery : undefined,
      tab === 'articles' ? categorySlug : undefined,
      sortOrder
    ),
    getNewsPaginatedCached(
      locale,
      tab === 'news' ? current_page : 1,
      tab === 'news' ? ACTIVE_PAGE_SIZE : INACTIVE_PAGE_SIZE,
      tab === 'news' ? searchQuery : undefined,
      sortOrder
    ),
    getMagazineIssuesPaginatedCached(
      locale,
      tab === 'magazine' ? current_page : 1,
      tab === 'magazine' ? ACTIVE_PAGE_SIZE : INACTIVE_PAGE_SIZE,
      tab === 'magazine' ? searchQuery : undefined,
      sortOrder
    ),
    getMajlisPaginatedCached(
      locale,
      tab === 'majlis' ? current_page : 1,
      tab === 'majlis' ? ACTIVE_PAGE_SIZE : INACTIVE_PAGE_SIZE,
      tab === 'majlis' ? searchQuery : undefined,
      sortOrder
    ),
    getPodcastsPaginatedCached(
      locale,
      tab === 'podcasts' ? current_page : 1,
      tab === 'podcasts' ? ACTIVE_PAGE_SIZE : INACTIVE_PAGE_SIZE,
      tab === 'podcasts' ? searchQuery : undefined,
      sortOrder
    ),
    // Use the lightweight category fetch — only name + slug, no articles
    getCategoriesForFilterCached(locale),
  ]);

  return (
    <main className="flex flex-col min-h-dvh">
      <InsightsContent
        activeTab={tab}
        currentPage={current_page}
        meta={{
          articles: articlesData.meta,
          news: newsData.meta,
          magazines: magazinesData.meta,
          majlises: majlisesData.meta,
          podcasts: podcastsData.meta
        }}
        locale={locale}
        articles={articlesData.data}
        news={newsData.data}
        magazines={magazinesData.data}
        majlises={majlisesData.data}
        podcasts={podcastsData.data}
        author={author || undefined}
        categories={categories as any}
        searchQuery={searchQuery || ""}
        categorySlug={categorySlug || "all"}
        sortOrder={sortOrder}
        savedIds={savedIds}
        isLoggedIn={!!session}
      />
    </main>
  );
}
