import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getCategoryBySlugCached } from "@/strapi/insights";
import Link from "next/link";
import { MoveLeft, MoveRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ArticlesGrid } from "@/components/insights/articles-grid";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const category = await getCategoryBySlugCached(slug, locale);
  if (!category) return {};

  return {
    title: category.name,
    description: category.description,
  };
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

  const articles = category.articles || [];

  // Use the new Strapi schema property: children_categories are actually accessible by category.children_categories directly.
  const subcategories = category.children_categories || [];

  const subcategoryQuery = searchParams.subcategory;
  const currentSubcategory =
    typeof subcategoryQuery === "string" ? subcategoryQuery : undefined;

  let displayedArticles = articles;

  if (currentSubcategory) {
    const subcat = await getCategoryBySlugCached(currentSubcategory, locale);
    if (subcat && subcat.articles) {
      displayedArticles = subcat.articles;
    } else {
      displayedArticles = [];
    }
  } else {
    const allChildArticles = [];
    for (const sub of subcategories) {
      const subcat = await getCategoryBySlugCached(sub.slug, locale);
      if (subcat && subcat.articles) {
        allChildArticles.push(...subcat.articles);
      }
    }

    // Combine and deduplicate articles by ID
    const combined = [...articles, ...allChildArticles];
    const uniqueArticles = new Map();
    for (const art of combined) {
      uniqueArticles.set(art.id, art);
    }

    // Sort combined articles by date descending
    displayedArticles = Array.from(uniqueArticles.values()).sort((a: any, b: any) => {
      const dateA = new Date(a.publish_date || a.createdAt || 0).getTime();
      const dateB = new Date(b.publish_date || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

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

      {displayedArticles.length === 0 ? (
        <div className="text-center py-24 border border-border/50 bg-muted/20 rounded-xl">
          <h3 className="text-xl font-bold mb-4">
            {currentSubcategory ? (locale === 'ar' ? 'لا توجد مقالات في هذه الفئة الفرعية' : 'No articles in this subcategory') : (it("empty") || "No articles found")}
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {locale === 'ar' ? 'لم يتم نشر أي مقالات هنا حتى الآن.' : 'No articles have been published here yet.'}
          </p>
          <Link href={`/${locale}/insights`} className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors">
            {locale === 'ar' ? 'تصفح الرؤى' : 'Browse Insights'}
          </Link>
        </div>
      ) : (
        <ArticlesGrid
          articles={displayedArticles as any}
          locale={locale as Locale}
          labels={labels}
        />
      )}
    </main>
  );
}
