'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, ArrowLeft, Star } from 'lucide-react';
import { type Locale } from '@/lib/i18n';
import { type StrapiArticle } from '@/strapi/insights';

type ArticlesGridProps = {
  articles: StrapiArticle[];
  locale: Locale;
  labels: Record<string, string>;
};

function formatDate(dateStr: string, locale: Locale) {
  try {
    return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export function ArticlesGrid({ articles, locale, labels }: ArticlesGridProps) {
  const isRtl = locale === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  if (!articles.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <p className="text-lg">{labels.empty}</p>
      </div>
    );
  }

  const featured = articles.filter((a) => a.is_featured);
  const rest = articles.filter((a) => !a.is_featured);

  return (
    <div className="space-y-12">
      {/* Featured Articles */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featured.slice(0, 2).map((article, i) => (
            <motion.div
              key={article.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Link
                href={`/${locale}/insights/articles/${article.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1.5 transition-all duration-300 h-full"
              >
                {article.cover_image?.url ? (
                  <div className="relative h-52 sm:h-64 overflow-hidden">
                    <Image
                      src={article.cover_image.url}
                      alt={article.title || article.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute top-4 start-4 inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white">
                      <Star className="h-3 w-3" /> {labels.featured}
                    </span>
                  </div>
                ) : (
                  <div className="relative h-52 sm:h-64 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="absolute top-4 start-4 inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white">
                      <Star className="h-3 w-3" /> {labels.featured}
                    </span>
                  </div>
                )}
                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(article.publish_date, locale)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center gap-1 text-sm font-semibold text-primary">
                    {labels.readMore}
                    <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Regular Articles */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((article, i) => (
            <motion.div
              key={article.id}
              custom={featured.length + i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Link
                href={`/${locale}/insights/articles/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 h-full"
              >
                {article.cover_image?.url ? (
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={article.cover_image.url}
                      alt={article.title || article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-primary/10 to-accent/10" />
                )}
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(article.publish_date, locale)}</span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-3 leading-snug">
                    {article.title}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center gap-1 text-sm font-medium text-primary">
                    {labels.readMore}
                    <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
