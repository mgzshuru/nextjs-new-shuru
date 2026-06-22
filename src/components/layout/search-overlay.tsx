"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { locales, type Locale } from "@/lib/i18n";
import type { HeaderMenuItem } from "@/strapi/header";
import { useTranslations } from "next-intl";

type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  items: HeaderMenuItem[];
};

type SearchEntry = {
  label: string;
  url: string;
  openInNewTab: boolean;
};

type SearchItem = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  url: string;
  image?: string | null;
};

type SearchResults = {
  articles: SearchItem[];
  categories: SearchItem[];
  pages: SearchItem[];
  authors: SearchItem[];
  magazine: SearchItem[];
  news: SearchItem[];
  majilis: SearchItem[];
};

const localePathPattern = new RegExp(`^/(${locales.join("|")})(/|$)`);

const isExternalUrl = (value: string) =>
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("mailto:") ||
  value.startsWith("tel:");

const toLocaleAwareUrl = (url: string, locale: Locale) => {
  if (isExternalUrl(url) || url.startsWith("#")) {
    return url;
  }

  if (!url.startsWith("/")) {
    return `/${locale}/${url}`;
  }

  if (localePathPattern.test(url)) {
    return url;
  }

  return url === "/" ? `/${locale}` : `/${locale}${url}`;
};

const getLinkProps = (openInNewTab: boolean) =>
  openInNewTab
    ? {
        target: "_blank" as const,
        rel: "noopener noreferrer" as const,
      }
    : {};

export default function SearchOverlay({ isOpen, onClose, locale, items }: SearchOverlayProps) {
  const t = useTranslations("search");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTerm("");
      setResults(null);
      setIsLoading(false);
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    // Intercept touchmove events on the body to prevent scrolling the underlying page
    const preventBackgroundScroll = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.scrollable-container')) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventBackgroundScroll, { passive: false });

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener('touchmove', preventBackgroundScroll);
    };
  }, [isOpen]);

  // Handle live search with 300ms debounce
  useEffect(() => {
    if (!term.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&locale=${locale}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Global search request failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [term, locale]);

  // Parse navigation items as shortcuts when search term is empty
  const navigationShortcuts = useMemo<SearchEntry[]>(() => {
    return items.flatMap((item) => [
      {
        label: item.label,
        url: item.url,
        openInNewTab: item.openInNewTab,
      },
      ...item.subItems.map((subItem) => ({
        label: subItem.label,
        url: subItem.url,
        openInNewTab: subItem.openInNewTab,
      })),
    ]);
  }, [items]);

  const hasResults = useMemo(() => {
    if (!results) return false;
    return (
      results.articles.length > 0 ||
      results.categories.length > 0 ||
      results.pages.length > 0 ||
      results.authors.length > 0 ||
      results.magazine.length > 0 ||
      results.news.length > 0 ||
      results.majilis.length > 0
    );
  }, [results]);

  if (!isOpen) {
    return null;
  }

  const sectionsToRender = results
    ? ([
        { key: "articles", data: results.articles },
        { key: "categories", data: results.categories },
        { key: "pages", data: results.pages },
        { key: "authors", data: results.authors },
        { key: "magazine", data: results.magazine },
        { key: "news", data: results.news },
        { key: "majilis", data: results.majilis },
      ] as const)
    : [];

  return (
    <div className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-md overflow-y-auto overscroll-contain scrollable-container" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 min-h-dvh flex flex-col">
        {/* Search Header Input Bar */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-lg">
          <div className="relative flex-1">
            {isLoading ? (
              <Loader2 className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary" />
            ) : (
              <Search className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            )}
            <input
              type="text"
              placeholder={t("placeholder")}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              className="h-11 w-full rounded-md border border-input bg-background ps-10 pe-3 text-base outline-none ring-ring transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close search" className="hover:bg-accent hover:text-accent-foreground h-11 w-11 rounded-lg">
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Search Results Area */}
        <div className="mt-6 flex-1 flex flex-col justify-start">
          {isLoading && !results ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t("loading")}</p>
            </div>
          ) : term && !isLoading && !hasResults ? (
            /* Empty State */
            <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm max-w-2xl mx-auto mt-10">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("noResults", { query: term })}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("suggestions")}
              </p>
            </div>
          ) : term && results ? (
            /* Results Grouped by Category */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-16">
              {sectionsToRender.map(
                ({ key, data }) =>
                  data.length > 0 && (
                    <div key={key} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
                        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
                          {t(`sections.${key}`)}
                        </h3>
                        <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                          {data.length}
                        </span>
                      </div>

                      <ul className="space-y-4">
                        {data.map((item) => (
                          <li key={item.id}>
                            <Link
                              href={item.url}
                              className="group flex gap-4 items-start rounded-lg p-2.5 transition hover:bg-accent border border-transparent hover:border-border"
                              onClick={onClose}
                            >
                              {item.image && (
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                                  <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition group-hover:scale-105"
                                    sizes="48px"
                                  />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                  {item.title}
                                </h4>
                                {item.description && (
                                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
              )}
            </div>
          ) : (
            /* Navigation Shortcuts (Term is empty) */
            <div className="max-w-2xl mx-auto w-full mt-6">
              <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-3 px-2">
                {locale === "ar" ? "روابط سريعة" : "Quick Links"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {navigationShortcuts.slice(0, 10).map((entry) => (
                  <Link
                    key={`${entry.label}-${entry.url}`}
                    href={toLocaleAwareUrl(entry.url, locale)}
                    {...getLinkProps(entry.openInNewTab)}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent transition"
                    onClick={onClose}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span>{entry.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}