import React from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { type Locale } from '@/lib/i18n';
import { getMagazineIssueBySlugCached } from '@/strapi/insights';
import { MagazineReadClient } from './magazine-read-client';
import { buildMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const issue = await getMagazineIssueBySlugCached(slug, locale);

  if (!issue) {
    return {
      title: 'Not Found',
    };
  }

  const defaultTitle = locale === 'ar' 
    ? `قراءة: ${issue.title} - العدد ${issue.issue_number || ''}`
    : `Read: ${issue.title} - Issue ${issue.issue_number || ''}`;

  const seo = issue.seo;
  const ogImg = (issue.cover_image || seo?.og_image) as any;

  return buildMetadata({
    locale,
    path: `/insights/magazine/${slug}/read`,
    title: seo?.meta_title || defaultTitle,
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

export default async function MagazineReadPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // Fetch data on the server side
  const issue = await getMagazineIssueBySlugCached(slug, locale);

  if (!issue || !issue.pdf_attachment?.url) {
    notFound();
  }

  const pdfUrl = issue.pdf_attachment.url;
  const magazineTitle = locale === 'ar'
    ? `${issue.title} - العدد ${issue.issue_number || ''}`
    : `${issue.title} - Issue ${issue.issue_number || ''}`;

  return (
    <MagazineReadClient
      pdfUrl={pdfUrl}
      magazineTitle={magazineTitle}
      magazineSlug={slug}
      downloadUrl={pdfUrl}
    />
  );
}
