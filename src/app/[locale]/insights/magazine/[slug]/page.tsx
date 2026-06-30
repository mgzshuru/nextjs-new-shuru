import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { getMagazineIssueBySlugCached } from "@/strapi/insights";
import Image from "next/image";
import Link from "next/link";
import { ArticlesGrid } from "@/components/insights/articles-grid";
import ReactMarkdown from 'react-markdown';
import { DownloadPdfButton } from "@/components/ui/download-pdf-button";
import { ShareButtons } from "@/components/insights/share-buttons";
import { SaveButton } from "@/components/insights/save-button";
import { getMe } from "@/lib/actions/auth";
import { isInsightSavedAction } from "@/lib/actions/saved-insights";
import { Calendar, Eye, Download } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const issue = await getMagazineIssueBySlugCached(slug, locale);

  if (!issue) {
    return {
      title: "Not Found",
    };
  }

  const seo = issue.seo;
  const ogImg = (issue.cover_image || seo?.og_image) as any;

  return buildMetadata({
    locale,
    path: `/insights/magazine/${slug}`,
    title: seo?.meta_title || issue.title,
    description: seo?.meta_description || issue.description || undefined,
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

export default async function MagazineIssuePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const issue = await getMagazineIssueBySlugCached(slug, locale);
  if (!issue) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'insights' });

  const issueNumberText = issue.issue_number 
    ? t('magazineSingle.issueNumber', { number: issue.issue_number }) 
    : issue.title;

  const publishDateText = issue.publish_date
    ? t('magazineSingle.publishDate', { date: new Date(issue.publish_date).toLocaleDateString(locale) })
    : '';

  const readPdfText = t('magazineSingle.readPdf');
  const downloadPdfText = t('magazineSingle.downloadPdf');
  const shareText = t('magazineSingle.share');
  const exploreOtherText = t('magazineSingle.exploreOther');
  const browseAllText = t('magazineSingle.browseAll');
  const articlesInIssueText = t('magazineSingle.articlesInIssue');

  const labels = {
    empty: locale === 'ar' ? 'لا توجد مقالات هنا.' : 'No articles found here.',
    readMore: locale === 'ar' ? 'اقرأ المزيد' : 'Read More',
    featured: locale === 'ar' ? 'مميز' : 'Featured',
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shuru.sa';
  const pageUrl = `${baseUrl}/${locale}/insights/magazine/${issue.slug}`;

  const [session, isSaved] = await Promise.all([
    getMe(),
    isInsightSavedAction(issue.documentId, 'magazine-issue'),
  ]);

  return (
    <div className="flex-1 pb-16 lg:pb-24">
      {/* Breadcrumbs */}
      <nav className="bg-neutral-50 dark:bg-neutral-900 border-b border-border/40 py-4 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs md:text-sm text-muted-foreground font-medium">
            <Link href={`/${locale}`} className="hover:text-primary transition-colors">
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <span className="text-neutral-400">/</span>
            <Link href={`/${locale}/insights`} className="hover:text-primary transition-colors">
              {locale === 'ar' ? 'الرؤى' : 'Insights'}
            </Link>
            <span className="text-neutral-400">/</span>
            <Link href={`/${locale}/insights/magazine`} className="hover:text-primary transition-colors">
              {locale === 'ar' ? 'المجلة' : 'Magazine'}
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-foreground font-semibold truncate max-w-[120px] sm:max-w-none">
              {issueNumberText}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Details Section */}
      <section className="container mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 items-start">
          {/* Cover Image Column */}
          <div className="lg:sticky lg:top-8 w-full max-w-sm mx-auto lg:col-span-1">
            <div className="aspect-[3/4] relative bg-neutral-100 dark:bg-neutral-800 shadow-2xl rounded-2xl overflow-hidden border border-border/50">
              {issue.cover_image?.url ? (
                <Image
                  src={issue.cover_image.url}
                  alt={issue.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-muted-foreground">
                  No Cover
                </div>
              )}
            </div>
          </div>

          {/* Issue Details Column */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div>
              {issue.issue_number && (
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-extrabold mb-4 select-none">
                  {issueNumberText}
                </span>
              )}

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
                {issue.title}
              </h1>

              {issue.publish_date && (
                <div className="flex items-center text-muted-foreground text-sm gap-2 mb-6">
                  <Calendar className="w-4.5 h-4.5" />
                  <span>{publishDateText}</span>
                </div>
              )}

              {issue.description && (
                <div className="prose prose-neutral dark:prose-invert md:prose-lg max-w-none mb-6 leading-relaxed">
                  <ReactMarkdown>{issue.description}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Actions Section */}
            {issue.pdf_attachment?.url && (
              <div className="border-t border-border/50 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                  <Link
                    href={`/${locale}/insights/magazine/${issue.slug}/read`}
                    className="inline-flex items-center justify-center rounded-xl bg-foreground text-background hover:opacity-90 active:scale-[0.98] px-6 py-3.5 font-bold transition-all gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    {readPdfText}
                  </Link>
                  <DownloadPdfButton
                    pdfUrl={issue.pdf_attachment.url}
                    fileName={`${issue.slug}.pdf`}
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted active:scale-[0.98] px-6 py-3.5 font-bold transition-all gap-2"
                    loadingText={locale === 'ar' ? 'جاري التحميل...' : 'Downloading...'}
                  >
                    <Download className="w-5 h-5" />
                    {downloadPdfText}
                  </DownloadPdfButton>
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <ShareButtons url={pageUrl} title={issue.title} shareLabel={shareText} />
              <SaveButton
                insightId={issue.documentId}
                insightType="magazine-issue"
                initialIsSaved={isSaved}
                isLoggedIn={!!session}
                locale={locale}
                variant="default"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="container mx-auto px-4 mt-12 md:mt-16">
        {issue.articles && issue.articles.length > 0 && (
          <div className="pt-12 border-t border-border/50">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-8">
              {articlesInIssueText}
            </h2>
            <ArticlesGrid articles={issue.articles} locale={locale} labels={labels} />
          </div>
        )}
      </section>

      {/* Footer Explore Navigation */}
      <section className="container mx-auto px-4 mt-16 md:mt-24">
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-border/40 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground mb-4">
            {exploreOtherText}
          </h2>
          <Link
            href={`/${locale}/insights/magazine`}
            className="inline-flex items-center justify-center rounded-xl bg-foreground text-background hover:opacity-90 active:scale-[0.98] px-8 py-3.5 font-bold transition-all"
          >
            {browseAllText}
          </Link>
        </div>
      </section>
    </div>
  );
}
