'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { type Locale } from '@/lib/i18n';
import { motion } from 'framer-motion';

export function HeroSection({ hero, locale }: { hero: import('@/strapi/home').StrapiHeroBlock; locale: Locale }) {
  const isRtl = locale === 'ar';
  const Icon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden bg-background py-16 sm:py-24 lg:py-32">
      {/* Elegant background gradients and blurs */}
      <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/5" />
      <div className="absolute top-1/4 -start-32 -z-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-30"></div>
      <div className="absolute top-1/4 -end-32 -z-10 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-30"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center"
      >
        <h1 className="mx-auto max-w-4xl text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight py-2 leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 dark:from-white dark:via-gray-200 dark:to-gray-400 drop-shadow-sm">
            {hero.title}
          </span>
        </h1>
        {hero.subtitle && (
          <p className="mx-auto mt-6 sm:mt-8 max-w-2xl text-base sm:text-lg md:text-xl leading-8 text-muted-foreground whitespace-pre-wrap font-medium">
            {hero.subtitle}
          </p>
        )}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          {hero.primaryCtaText && hero.primaryCtaLink && (
            <Link
              href={`/${locale}${hero.primaryCtaLink}`}
              className="group relative inline-flex h-14 items-center justify-center rounded-full bg-primary px-10 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
              <span className="relative z-10">{hero.primaryCtaText}</span>
            </Link>
          )}
          {hero.secondaryCtaText && hero.secondaryCtaLink && (
            <Link
              href={`/${locale}${hero.secondaryCtaLink}`}
              className="inline-flex h-14 items-center justify-center rounded-full border border-border/60 bg-background/50 backdrop-blur-sm px-10 text-base font-semibold text-foreground shadow-sm hover:bg-accent/10 hover:border-accent/50 hover:text-accent-foreground hover:-translate-y-1 transition-all duration-300"
            >
              {hero.secondaryCtaText}
              <Icon className="mx-2 h-5 w-5 transform transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          )}
        </div>
      </motion.div>
    </section>
  );
}
