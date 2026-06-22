'use client';
import React from 'react';
import Image from 'next/image';
import { TableOfContents } from './table-of-contents';
import { useHasHeaders } from '@/hooks/use-has-headers';
import type { StrapiAuthor } from '@/strapi/insights';
import { ShareButtons } from './share-buttons';
import { useTranslations } from 'next-intl';
import { SaveButton } from './save-button';

interface ArticleLayoutProps {
  children: React.ReactNode;
  author?: StrapiAuthor;
  shareUrl?: string;
  shareTitle?: string;
  insightId?: string;
  insightType?: string;
  isLoggedIn?: boolean;
  initialIsSaved?: boolean;
  locale?: string;
}

export function ArticleLayout({
  children,
  author,
  shareUrl,
  shareTitle,
  insightId,
  insightType,
  isLoggedIn = false,
  initialIsSaved = false,
  locale = 'en',
}: ArticleLayoutProps) {
  const hasHeaders = useHasHeaders('article-content');
  const t = useTranslations('insights');

  if (hasHeaders) {
    // Two-column layout with sidebar
    return (
      <div className="container mx-auto px-4 grid lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Article Content */}
        <main id="article-content" className="lg:col-span-8 order-2 lg:order-1" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          {children}
        </main>

        {/* Enhanced Sidebar */}
        <aside className="lg:col-span-4 space-y-6 lg:space-y-8 order-1 lg:order-2">
          {/* Mobile Table of Contents - Show only on mobile */}
          <div className="lg:hidden">
            <TableOfContents articleContentId="article-content" />
          </div>

          {/* Author Card */}
          {author && (
            <div className="bg-white p-6 lg:p-8 border border-neutral-200 shadow-sm rounded-xl">
              <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                <h3 className="text-lg lg:text-xl font-bold text-neutral-900">عن الكاتب</h3>
              </div>
              <div className="flex items-start gap-4 lg:gap-6" dir="rtl">
                {author.avatar?.url && (
                  <div className="relative flex-shrink-0">
                    <Image
                      src={author.avatar.url}
                      alt={author.name}
                      width={60}
                      height={60}
                      className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover border-2 border-neutral-100"
                    />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="flex-1 text-right">
                  <h4 className="font-bold text-neutral-900 text-base lg:text-lg mb-2">
                    {author.name}
                  </h4>
                  {(author.jobTitle || author.organization) && (
                    <p className="text-xs lg:text-sm text-neutral-600 mb-3 leading-relaxed">
                      {[author.jobTitle, author.organization].filter(Boolean).join(' • ')}
                    </p>
                  )}
                  <div className="flex gap-2 justify-end">
                    {author.linkedin_url && (
                      <a
                        href={author.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Share Buttons */}
          {shareUrl && shareTitle && (
            <div className="bg-white p-6 lg:p-8 border border-neutral-200 shadow-sm rounded-xl space-y-6">
              <ShareButtons url={shareUrl} title={shareTitle} shareLabel={t('share')} />
              {insightId && insightType && (
                <div className="pt-4 border-t border-neutral-100">
                  <SaveButton
                    insightId={insightId}
                    insightType={insightType}
                    initialIsSaved={initialIsSaved}
                    isLoggedIn={isLoggedIn}
                    locale={locale}
                    variant="default"
                    className="w-full justify-center"
                  />
                </div>
              )}
            </div>
          )}

          {/* Desktop Table of Contents - Hidden on mobile */}
          <div className="hidden lg:block sticky top-32 z-10">
            <TableOfContents articleContentId="article-content" />
          </div>
        </aside>
      </div>
    );
  }

  // Single-column layout when no headers
  return (
    <div className="container mx-auto px-4 max-w-4xl">
      {/* Article Content - Full Width */}
      <main id="article-content" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {children}

        {/* Share Buttons */}
        {shareUrl && shareTitle && (
          <div className="mt-12 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <ShareButtons url={shareUrl} title={shareTitle} shareLabel={t('share')} />
            {insightId && insightType && (
              <div className="sm:self-end">
                <SaveButton
                  insightId={insightId}
                  insightType={insightType}
                  initialIsSaved={initialIsSaved}
                  isLoggedIn={isLoggedIn}
                  locale={locale}
                  variant="default"
                />
              </div>
            )}
          </div>
        )}

        {/* Author Card - Inline after content when no sidebar */}
        {author && (
          <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-neutral-200">
            <div className="bg-white p-6 md:p-8 border border-neutral-200 shadow-sm rounded-xl">
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                <h3 className="text-lg md:text-xl font-bold text-neutral-900">عن الكاتب</h3>
              </div>
              <div className="flex items-start gap-4 md:gap-6" dir="rtl">
                {author.avatar?.url && (
                  <div className="relative flex-shrink-0">
                    <Image
                      src={author.avatar.url}
                      alt={author.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover border-2 border-neutral-100"
                    />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-primary border-2 border-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="flex-1 text-right">
                  <h4 className="font-bold text-neutral-900 text-lg md:text-xl mb-3">
                    {author.name}
                  </h4>
                  {(author.jobTitle || author.organization) && (
                    <p className="text-sm md:text-base text-neutral-600 mb-4 leading-relaxed">
                      {[author.jobTitle, author.organization].filter(Boolean).join(' • ')}
                    </p>
                  )}
                  <div className="flex gap-3 justify-end">
                    {author.linkedin_url && (
                      <a
                        href={author.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}