'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PaginationControls } from '@/components/ui/pagination-controls';
import type { PaginationMeta, StrapiCategory } from '@/strapi/insights';
import { type Locale } from '@/lib/i18n';
import { InsightsHero } from './insights-hero';
import { ArticlesGrid } from './articles-grid';
import { NewsGrid } from './news-grid';
import { MagazineGrid } from './magazine-grid';
import { MajlisGrid } from './majlis-grid';
import type { StrapiArticle, StrapiNewsItem, StrapiMagazineIssue, StrapiMajlis, StrapiPodcast, StrapiAuthor } from '@/strapi/insights';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { SearchFilterControls } from './search-filter-controls';

type InsightsContentProps = {
  activeTab?: string;
  currentPage?: number;
  meta?: Record<string, { pagination: PaginationMeta }>;
  locale: Locale;
  articles: StrapiArticle[];
  news: StrapiNewsItem[];
  magazines: StrapiMagazineIssue[];
  majlises: StrapiMajlis[];
  podcasts: StrapiPodcast[];
  author?: StrapiAuthor;
  categories?: StrapiCategory[];
  searchQuery?: string;
  categorySlug?: string;
  sortOrder?: 'newest' | 'oldest';
};

const defaultLabels = {
  en: {
    badge: 'Knowledge Hub',
    title: 'Explore Our Insights',
    subtitle: 'Stay updated with the latest articles, news, and perspectives.',
    articles: 'Articles',
    news: 'News',
    magazine: 'Publication',
    majlis: 'Majlis',
    empty: 'No items found matching your filters.',
  },
  ar: {
    badge: 'مركز المعرفة',
    title: 'استكشف رؤيتنا',
    subtitle: 'ابق على اطلاع بأحدث المقالات والأخبار والرؤى.',
    articles: 'مقالات',
    news: 'أخبار',
    magazine: 'مجلة',
    majlis: 'مجلس',
    empty: 'لم يتم العثور على عناصر تطابق اختياراتك.',
  }
};

export function InsightsContent({
  activeTab: initialTab = 'articles',
  currentPage = 1,
  meta,
  locale,
  articles,
  news,
  magazines,
  majlises,
  author,
  categories = [],
  searchQuery = '',
  categorySlug = 'all',
  sortOrder = 'newest',
}: InsightsContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tSearch = useTranslations("search");
  
  const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => {
    if (initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const labels = defaultLabels[locale] || defaultLabels.en;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearAuthorFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('author');
    const newQuery = params.toString();
    router.push(newQuery ? `${pathname}?${newQuery}` : pathname);
  };

  return (
    <>
      <InsightsHero
        locale={locale}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        labels={labels}
      />
      <div className="container mx-auto px-4 pb-24 pt-12" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <SearchFilterControls
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          categories={categories}
          selectedCategory={categorySlug}
          showCategoryFilter={activeTab === 'articles'}
        />

        {activeTab === 'articles' && author && (
          <div className="mb-8 flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary">
            <span className="font-semibold">
              {tSearch("filter.author", { name: author.name })}
            </span>
            <button
              onClick={handleClearAuthorFilter}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
              aria-label={tSearch("filter.clear")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {activeTab === 'articles' && <ArticlesGrid articles={articles} locale={locale} labels={labels} />}
        {activeTab === 'news' && <NewsGrid news={news} locale={locale} labels={labels} />}
        {activeTab === 'magazine' && <MagazineGrid issues={magazines} locale={locale} labels={labels} />}
        {activeTab === 'majlis' && <MajlisGrid majlises={majlises} locale={locale} labels={labels} />}

        {meta && meta[activeTab] && meta[activeTab].pagination.pageCount > 1 && (
          <PaginationControls
            currentPage={currentPage}
            pageCount={meta[activeTab].pagination.pageCount}
          />
        )}
      </div>
    </>
  );
}
