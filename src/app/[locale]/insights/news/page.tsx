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
    path: "/insights/news",
    title: t("tabs.news") || "News",
    description: t("tabs.subtitle") || "Stay updated with the latest insights.",
  });
}
import { getNewsPaginatedCached } from "@/strapi/insights";
import Link from "next/link";
import Image from "next/image";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SearchFilterControls } from "@/components/insights/search-filter-controls";

// Shared blur placeholder for all news card images — defined once to avoid inline duplication
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI1IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjUiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=";

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

  const { data: newsItems, meta } = await getNewsPaginatedCached(locale, current_page, 9, searchQuery, sortOrder);
  const t = await getTranslations({ locale, namespace: 'insights' });

  return (
    <main className="container py-24 mx-auto px-4 max-w-7xl">
      <div className="mb-12 border-b border-border/50 pb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{t('tabs.news')}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t('tabs.subtitle')}</p>
      </div>

      <SearchFilterControls
        searchQuery={searchQuery || ""}
        sortOrder={sortOrder}
        showCategoryFilter={false}
      />

      {newsItems.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl bg-muted/10">
          <p className="text-muted-foreground">{locale === 'ar' ? 'لم يتم العثور على أخبار.' : 'No news found.'}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((news, index) => (
              <Link key={news.id} href={`/${locale}/insights/news/${news.slug}`} className="block group">
                <div className="border rounded-lg overflow-hidden flex flex-col h-full bg-card hover:shadow-lg transition">
                  <div className="aspect-video bg-muted relative">
                    {news.cover_image?.url && (
                      <Image
                        src={news.cover_image.url}
                        alt={news.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        // First image gets priority (LCP candidate); rest lazy-load
                        priority={index === 0}
                        loading={index === 0 ? undefined : "lazy"}
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                      />
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition">{news.title}</h2>
                    {news.description && (
                      <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">{news.description}</p>
                    )}
                    {news.news_date && (
                      <time dateTime={news.news_date} className="text-sm text-muted-foreground mt-auto">
                        {new Date(news.news_date).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <PaginationControls pageCount={meta.pagination.pageCount} currentPage={meta.pagination.page} />
        </>
      )}
    </main>
  );
}
