import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { getArticleBySlugCached } from "@/strapi/insights";
import { BlockRenderer } from "@/components/page/block-renderer";
import { ArticleLayout } from "@/components/insights/article-layout";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getMe } from "@/lib/actions/auth";
import { isInsightSavedAction } from "@/lib/actions/saved-insights";
import { buildMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const article = await getArticleBySlugCached(slug, locale);

  if (!article) {
    return {
      title: "Not Found",
    };
  }

  const seo = article.seo;
  const ogImg = (article.cover_image || seo?.og_image) as any;

  return buildMetadata({
    locale,
    path: `/insights/articles/${slug}`,
    title: seo?.meta_title || article.title,
    description: seo?.meta_description || undefined,
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

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getArticleBySlugCached(slug, locale);
  if (!article) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shuru.sa';
  const pageUrl = `${baseUrl}/${locale}/insights/articles/${article.slug}`;

  const [session, isSaved] = await Promise.all([
    getMe(),
    isInsightSavedAction(article.documentId, 'article'),
  ]);

  // Pass an empty testimonials array since generic blocks might require it but usually don't if they aren't the testimonial block
  return (
    <div className="flex-1 pb-16 lg:pb-24">
      {/* Article Header */}
      <section className="container mx-auto px-4 py-8 lg:py-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{article.title}</h1>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          {article.publish_date && (
            <p className="text-sm text-neutral-500">
              {new Date(article.publish_date).toLocaleDateString(locale)}
            </p>
          )}

          {article.categories && article.categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {article.categories.map((cat) => (
                <Link key={cat.id} href={`/${locale}/insights/categories/${cat.slug}`}>
                  <Badge variant="secondary" className="hover:bg-primary hover:text-white transition-colors">
                    {cat.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {article.enable_cover_image !== false && article.cover_image?.url && (
          <div className="w-full flex justify-center mb-12">
            <Image
              src={article.cover_image.url}
              alt={article.title}
              width={1376}
              height={768}
              sizes="(max-width: 1376px) 100vw, 1376px"
              className="w-full h-auto rounded-xl object-cover"
              style={{ maxWidth: 1376, maxHeight: 768 }}
              priority
            />
          </div>
        )}
      </section>

      {/* Article Blocks & Layout */}
      <ArticleLayout
        author={article.author}
        shareUrl={pageUrl}
        shareTitle={article.title}
        insightId={article.documentId}
        insightType="article"
        isLoggedIn={!!session}
        initialIsSaved={isSaved}
        locale={locale}
      >
        {article.blocks?.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            locale={locale}
            testimonials={[]}
          />
        ))}
      </ArticleLayout>
    </div>
  );
}
