"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LogIn, ArrowRight, ArrowLeft, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { locales, type Locale } from "@/lib/i18n";
import type { HeaderMenuItem } from "@/strapi/header";
import type { StrapiMagazineIssue } from "@/strapi/insights";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  items: HeaderMenuItem[];
  latestMagazine?: StrapiMagazineIssue | null;
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

export default function MobileMenu({ isOpen, onClose, locale, items, latestMagazine }: MobileMenuProps) {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) return;

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
  const t = useTranslations("insights");

  const menuItems = useMemo(() => {
    const sideItems = items.filter((item) => item.onSideBar);
    return sideItems.length > 0 ? sideItems : items;
  }, [items]);

  const toggleExpanded = (itemOrder: number) => {
    setExpandedItems((prev) =>
      prev.includes(itemOrder) ? prev.filter((value) => value !== itemOrder) : [...prev, itemOrder]
    );
  };

  const isRtl = locale === "ar";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/75 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 end-0 z-50 w-[280px] border-s border-border bg-card p-3 shadow-2xl transition-transform duration-300 transform-gpu sm:w-[320px] overflow-y-auto flex flex-col justify-between overscroll-contain scrollable-container",
          isOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        )}
        aria-label="Mobile menu"
      >
        <div className="flex-1 pb-6">
          {/* Menu Header with Close Button */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-border pt-1">
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase px-1.5">
              {locale === "ar" ? "القائمة" : "Menu"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-accent rounded-xl cursor-pointer"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-3 border-b border-border pb-3">
            {menuItems.map((item) => {
              const hasSubItems = item.subItems.length > 0;
              const expanded = expandedItems.includes(item.order);

              return (
                <div key={`${item.label}-${item.url}`}>
                  {hasSubItems ? (
                    <Button
                      variant="ghost"
                      size="default"
                      className="min-h-12 w-full justify-between px-3 py-3 text-base font-medium"
                      onClick={() => toggleExpanded(item.order)}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", expanded ? "rotate-180" : "rotate-0")} />
                    </Button>
                  ) : (
                    <Link
                      href={toLocaleAwareUrl(item.url, locale)}
                      {...getLinkProps(item.openInNewTab)}
                      onClick={onClose}
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-md px-3 py-3 text-base font-medium hover:bg-accent"
                    >
                      {item.label}
                    </Link>
                  )}

                  {hasSubItems && expanded ? (
                    <div className="mb-2 mt-1 space-y-1 rounded-md bg-accent/60 p-2">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={`${subItem.label}-${subItem.url}`}
                          href={toLocaleAwareUrl(subItem.url, locale)}
                          {...getLinkProps(subItem.openInNewTab)}
                          onClick={onClose}
                          className="inline-flex min-h-11 w-full items-center justify-center rounded-md px-3 py-2 text-sm hover:bg-card"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Magazine Poster Card */}
          {latestMagazine && (
            <div className="mt-6 px-1">
              <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("latestIssue")}
              </h3>
              <Link
                href={`/${locale}/insights/magazine/${latestMagazine.slug}`}
                onClick={onClose}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-accent/30 p-2.5 transition-all duration-300 hover:bg-accent/60 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
              >
                {/* Cover image - portrait aspect ratio */}
                <div className="relative aspect-[2480/3508] w-full overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                  {isOpen && latestMagazine.cover_image?.url ? (
                    <Image
                      src={latestMagazine.cover_image.url}
                      alt={latestMagazine.title}
                      fill
                      sizes="255px"
                      loading="lazy"
                      quality={75}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSIxMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSIxMSIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg=="
                    />
                  ) : null}
                  {latestMagazine.issue_number && (
                    <div className="absolute top-2 end-2 rounded-full bg-primary/90 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      #{latestMagazine.issue_number}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-col gap-1 px-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                    {latestMagazine.title}
                  </p>
                  <span className="inline-flex items-center text-xs font-medium text-primary mt-1 gap-1.5">
                    {t("readLatest")}
                    <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5" />
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-2 px-2 pt-4 border-t border-border/50">
          <Link href={`/${locale}/auth/login`} onClick={onClose} className="block">
            <Button variant="outline" className="w-full justify-center">
              <LogIn className="me-2 h-4 w-4" />
              Login
            </Button>
          </Link>

          <Link href={`/${locale}/subscribe`} onClick={onClose} className="block">
            <Button className="w-full justify-center">Subscribe now</Button>
          </Link>
        </div>
      </aside>
    </>
  );
}