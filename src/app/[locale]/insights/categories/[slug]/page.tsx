import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getCategoryBySlugCached, getArticlesPaginatedCached } from "@/strapi/insights";
import Link from "next/link";
import { MoveLeft, MoveRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ArticlesGrid } from "@/components/insights/articles-grid";
import { cn } from "@/lib/utils";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SearchFilterControls } from "@/components/insights/search-filter-controls";
import { buildMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const category = await getCategoryBySlugCached(slug, locale);
  if (!category) return {};

  return buildMetadata({
    locale,
    path: `/insights/categories/${slug}`,
    title: category.name,
    description: category.description,
  });
}

// Server Component for Subcategory Pills
function SubcategoryPills({
  subcategories,
  currentSubcategory,
  locale,
  categorySlug,
  allLabel,
}: {
  subcategories: { slug: string; name: string }[];
  currentSubcategory?: string;
  locale: string;
  categorySlug: string;
  allLabel: string;
}) {
  if (!subcategories || subcategories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-12">
      <Link
        href={`/${locale}/insights/categories/${categorySlug}`}
        className={cn(
          "px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-colors border",
          !currentSubcategory
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-muted-foreground hover:bg-muted"
        )}
      >
        {allLabel}
      </Link>
      {subcategories.map((sub) => (
        <Link
          key={sub.slug}
          href={`/${locale}/insights/categories/${categorySlug}?subcategory=${sub.slug}`}
          className={cn(
            "px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-colors border",
            currentSubcategory === sub.slug
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          {sub.name}
        </Link>
      ))}
    </div>
  );
}

export default async function CategoryPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { locale, slug } = params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("common");
  const it = await getTranslations("insights");
  const category = await getCategoryBySlugCached(slug, locale);

  if (!category) notFound();

  const subcategories = category.children_categories || [];

  const subcategoryQuery = searchParams.subcategory;
  const currentSubcategory =
    typeof subcategoryQuery === "string" ? subcategoryQuery : undefined;

  const pageQuery = searchParams.page;
  const page = typeof pageQuery === "string" ? parseInt(pageQuery, 10) : 1;
  const current_page = isNaN(page) || page < 1 ? 1 : page;

  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const sortOrder = searchParams.sort === 'oldest' ? 'oldest' : 'newest';

  // If a subcategory is selected, we filter only by it.
  // Otherwise, we match the parent category or any of its children.
  const targetCategorySlugs = currentSubcategory 
    ? currentSubcategory 
    : [slug, ...subcategories.map(sub => sub.slug)];

  const { data: displayedArticles, meta } = await getArticlesPaginatedCached(
    locale as Locale,
    current_page,
    9,
    undefined,
    searchQuery,
    targetCategorySlugs,
    sortOrder
  );

  const labels = {
    empty: it("empty") || "No articles",
    featured: it("featured") || "Featured",
    readMore: it("readMore") || "Read More",
  };

  return (
    <main className="container py-24 mx-auto px-4 max-w-7xl">
      <Link
        href={`/${locale}/insights/categories`}
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors group"
      >
        {locale === "ar" ? (
          <MoveRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        ) : (
          <MoveLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        )}
        {t("back") || "Back"}
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      <SubcategoryPills
        subcategories={subcategories}
        currentSubcategory={currentSubcategory}
        locale={locale}
        categorySlug={slug}
        allLabel={it("all") || "All"}
      />

      <SearchFilterControls
        searchQuery={searchQuery || ""}
        sortOrder={sortOrder}
        showCategoryFilter={false}
      />

      {displayedArticles.length === 0 ? (
        <div className="text-center py-24 border border-border/50 bg-muted/20 rounded-xl">
          <h3 className="text-xl font-bold mb-4">
            {currentSubcategory ? (locale === 'ar' ? 'لا توجد مقالات في هذه الفئة الفرعية' : 'No articles in this subcategory') : (it("empty") || "No articles found")}
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {locale === 'ar' ? 'لم يتم العثور على أي مقالات تطابق اختياراتك.' : 'No articles match your search criteria.'}
          </p>
          <Link href={`/${locale}/insights`} className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors">
            {locale === 'ar' ? 'تصفح الرؤى' : 'Browse Insights'}
          </Link>
        </div>
      ) : (
        <>
          <ArticlesGrid
            articles={displayedArticles as any}
            locale={locale as Locale}
            labels={labels}
          />
          <PaginationControls
            currentPage={current_page}
            pageCount={meta.pagination.pageCount}
          />
        </>
      )}
    </main>
  );
}
