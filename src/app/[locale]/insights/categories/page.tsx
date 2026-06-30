import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getCategoriesCached } from "@/strapi/insights";
import Link from "next/link";
import { MoveLeft, MoveRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "insights" });
  return buildMetadata({
    locale,
    path: "/insights/categories",
    title: t("categories") || "Categories",
    description: t("tabs.subtitle") || "Browse all insight categories",
  });
}

export default async function CategoriesIndexPage({ params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("common");
  const categories = await getCategoriesCached(locale);

  // Only keep categories that have at least one article
  const activeCategories = categories?.filter((c: any) => c.articles && c.articles.length > 0) || [];

  if (activeCategories.length === 0) {
    return (
      <main className="container py-24 mx-auto px-4">
        <h1 className="text-4xl font-bold mb-12">Categories</h1>
        <p className="text-muted-foreground">{locale === "ar" ? "لا توجد فئات." : "No categories found."}</p>
      </main>
    );
  }

  const rootCategories = activeCategories.filter((c: any) => !c.parent_category);
  const otherCategories = activeCategories.filter((c: any) => c.parent_category);

  return (
    <main className="container py-24 mx-auto px-4 max-w-7xl">
      <Link
        href={`/${locale}/insights`}
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors group"
      >
        {locale === "ar" ? (
          <MoveRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        ) : (
          <MoveLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        )}
        {t("back")}
      </Link>

      <h1 className="text-4xl font-bold mb-12">{locale === "ar" ? "الفئات" : "Categories"}</h1>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <div className="w-1 h-8 bg-primary rounded-full mx-3" />
          {locale === "ar" ? "الفئات الرئيسية" : "Main Categories"}
        </h2>
        {rootCategories.length === 0 ? (
          <p className="text-muted-foreground px-4">No main categories found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rootCategories.map((category: any) => (
              <Link
                key={category.id}
                href={`/${locale}/insights/categories/${category.slug}`}
                className="block p-6 border border-border/50 rounded-xl bg-card hover:bg-muted/50 hover:shadow-lg transition-all group"
              >
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {otherCategories.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <div className="w-1 h-8 bg-muted-foreground/30 rounded-full mx-3" />
            {locale === "ar" ? "فئات أخرى" : "Other Categories"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherCategories.map((category: any) => (
              <Link
                key={category.id}
                href={`/${locale}/insights/categories/${category.slug}`}
                className="block p-6 border border-border/50 rounded-xl bg-card hover:bg-muted/50 hover:shadow-lg transition-all group"
              >
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}