'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Hash, ArrowRight, ArrowLeft } from 'lucide-react';
import { type Locale } from '@/lib/i18n';
import { type StrapiMagazineIssue } from '@/strapi/insights';
import { SaveButton } from './save-button';

type MagazineGridProps = {
  issues: StrapiMagazineIssue[];
  locale: Locale;
  labels: Record<string, string>;
  savedIds?: string[];
  isLoggedIn?: boolean;
};

function formatDate(dateStr: string, locale: Locale) {
  try {
    return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
    });
  } catch {
    return dateStr;
  }
}

export function MagazineGrid({
  issues,
  locale,
  labels,
  savedIds = [],
  isLoggedIn = false,
}: MagazineGridProps) {
  const isRtl = locale === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  if (!issues.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <p className="text-lg">{labels.empty}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {issues.map((issue, index) => (
        <div
          key={issue.id}
        >
          <div
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-xl hover:shadow-primary/15 hover:-translate-y-2 transition-all duration-300 h-full"
          >
            {/* Absolute link overlay to make whole card clickable safely */}
            <Link
              href={`/${locale}/insights/magazine/${issue.slug}`}
              className="absolute inset-0 z-10"
              aria-label={issue.title}
            />

            {/* Magazine cover - portrait aspect ratio */}
            <div className="relative aspect-[2480/3508] overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
              {issue.cover_image?.url ? (
                <Image
                  src={issue.cover_image.url}
                  alt={issue.title || issue.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 34vw, (max-width: 1024px) 26vw, 21vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority={index < 5}
                  loading={index < 5 ? 'eager' : 'lazy'}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSIxMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSIxMSIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg=="
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-3">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Hash className="h-8 w-8 text-primary/60" />
                  </div>
                </div>
              )}
              {issue.issue_number && (
                <div className="absolute top-2 start-2 rounded-full bg-primary/90 text-white text-[11px] font-bold px-2.5 py-1 z-20">
                  #{issue.issue_number}
                </div>
              )}
              {/* Save button overlay */}
              <div className="absolute top-2 end-2 z-20">
                <SaveButton
                  insightId={issue.documentId}
                  insightType="magazine-issue"
                  initialIsSaved={savedIds.includes(issue.documentId)}
                  isLoggedIn={isLoggedIn}
                  locale={locale}
                />
              </div>
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <span className="text-white text-xs font-semibold flex items-center gap-1">
                  {labels.readMore}
                  <Arrow className="h-3 w-3" />
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-1.5 z-20 pointer-events-none">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {issue.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(issue.publish_date, locale)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
