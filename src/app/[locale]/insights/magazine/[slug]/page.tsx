import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { getMagazineIssueBySlugCached } from "@/strapi/insights";
import Image from "next/image";
import Link from "next/link";
import { ArticlesGrid } from "@/components/insights/articles-grid";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DownloadPdfButton } from "@/components/ui/download-pdf-button";
import { ShareButtons } from "@/components/insights/share-buttons";
import { Calendar, Eye, Download } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { BreadcrumbTitleSetter } from "@/components/shared/breadcrumb-context";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const issue = await getMagazineIssueBySlugCached(slug, locale);

  if (!issue) {
    return {};
  }

  const issueNumberText = issue.issue_number ? ` #${issue.issue_number}` : '';
  const title = issue.title ? `${issue.title}${issueNumberText}` : `Magazine Issue${issueNumberText}`;

  const ogImg = issue.cover_image as any;

  return buildMetadata({
    locale,
    path: `/insights/magazine/${issue.slug}`,
    title,
    description: issue.description || undefined,
    ogImage: ogImg ? {
      url: ogImg.url,
      width: ogImg.width,
      height: ogImg.height,
      alt: ogImg.alternativeText,
    } : undefined,
    ogType: "magazine",
  });
}

export default async function MagazineIssuePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const issue = await getMagazineIssueBySlugCached(slug, locale);

  if (!issue) {
    redirect(`/${locale}/insights/magazine`);
  }

  const issueNumberText = issue.issue_number
    ? (locale === 'ar' ? `الإصدار #${issue.issue_number}` : `Issue #${issue.issue_number}`)
    : (locale === 'ar' ? 'عدد المجلة' : 'Magazine Issue');

  const downloadPdfText = locale === 'ar' ? 'تحميل النسخة الرقمية' : 'Download Digital Copy';
  const readPdfText = locale === 'ar' ? 'قراءة الإصدار' : 'Read Publication';
  const articlesInIssueText = locale === 'ar' ? 'مقالات في هذا العدد' : 'Articles in this Issue';
  const exploreOtherText = locale === 'ar' ? 'استكشف أعداداً أخرى' : 'Explore Other Issues';
  const browseAllText = locale === 'ar' ? 'تصفح جميع الأعداد' : 'Browse All Issues';
  const shareText = locale === 'ar' ? 'مشاركة' : 'Share';

  const labels = {
    empty: locale === 'ar' ? 'لا توجد مقالات مرتبطة بهذا العدد.' : 'No articles linked to this issue.',
    readMore: locale === 'ar' ? 'اقرأ المزيد' : 'Read More',
    featured: locale === 'ar' ? 'مميز' : 'Featured',
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shuru.sa';
  const pageUrl = `${baseUrl}/${locale}/insights/magazine/${issue.slug}`;

  return (
    <div className="flex-1 pb-16 lg:pb-24">
      <BreadcrumbTitleSetter path={`/${locale}/insights/magazine/${issue.slug}`} title={issueNumberText} />

      {/* Main Details Section */}
      <section className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Cover image column */}
          <div className="md:col-span-5 lg:col-span-4 w-full flex justify-center">
            <div className="relative w-full max-w-sm aspect-[2480/3508] rounded-2xl overflow-hidden shadow-2xl border border-border/60 bg-neutral-100">
              {issue.cover_image?.url && (
                <Image
                  src={issue.cover_image.url}
                  alt={issue.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                  priority
                />
              )}
            </div>
          </div>

          {/* Details column */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              {issue.issue_number && (
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {issueNumberText}
                </span>
              )}
              {issue.publish_date && (
                <span className="text-sm text-neutral-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  {new Date(issue.publish_date).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                  })}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
              {issue.title}
            </h1>

            {issue.description && (
              <div className="text-base md:text-lg text-muted-foreground leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{issue.description}</ReactMarkdown>
              </div>
            )}

            {/* Action buttons */}
            {issue.pdf_attachment?.url && (
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <div className="flex flex-wrap gap-3">
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
            <div className="border-t border-border/50 pt-6">
              <ShareButtons url={pageUrl} title={issue.title} shareLabel={shareText} />
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
