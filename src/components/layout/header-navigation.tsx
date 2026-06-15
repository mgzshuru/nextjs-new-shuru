"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, Search, User } from "lucide-react";
import { locales, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { HeaderMenuItem, StrapiTopBar } from "@/strapi/header";
import type { StrapiMagazineIssue } from "@/strapi/insights";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/layout/mobile-menu";
import TopBanner from "@/components/layout/top-banner";
import SearchOverlay from "@/components/layout/search-overlay";
import { ThemeLogo } from "@/components/layout/theme-logo";

type HeaderNavigationProps = {
  locale: Locale;
  items: HeaderMenuItem[];
  lightLogoUrl: string | null;
  darkLogoUrl: string | null;
  logoAlt: string;
  topBar: StrapiTopBar | null;
  latestMagazine?: StrapiMagazineIssue | null;
  user?: { id: number; username: string; email: string } | null;
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

export function HeaderNavigation({
  locale,
  items,
  lightLogoUrl,
  darkLogoUrl,
  logoAlt,
  topBar,
  latestMagazine,
  user = null,
}: HeaderNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(topBar?.isVisible ?? false);
  const pathname = usePathname();
  const router = useRouter();

  const headerItems = items.filter((item) => item.onHeader);

  useEffect(() => {
    if (!isMenuOpen && !isSearchOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, isSearchOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(".header-dropdown-item")) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openDropdown]);

  const normalizePath = (value: string) => {
    const withoutQuery = value.split("?")[0].split("#")[0];
    if (withoutQuery.length > 1 && withoutQuery.endsWith("/")) {
      return withoutQuery.slice(0, -1);
    }
    return withoutQuery;
  };

  const isItemActive = (url: string) => {
    const target = normalizePath(toLocaleAwareUrl(url, locale));
    const current = normalizePath(pathname || `/${locale}`);

    if (target === `/${locale}`) {
      return current === target;
    }

    return current === target || current.startsWith(`${target}/`);
  };

  return (
    <>
      {showBanner && topBar?.message ? (
        <TopBanner
          message={topBar.message}
          linkUrl={toLocaleAwareUrl(topBar.linkUrl || `/${locale}/subscribe`, locale)}
          linkText={topBar.linkText || "Subscribe"}
          onDismiss={() => setShowBanner(false)}
        />
      ) : null}

      <div
        className="relative rounded-none border border-border bg-card/90 px-3 pt-2 pb-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="grid min-h-[50px] grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              aria-label="Menu"
              variant="ghost"
              size="icon"
              className="h-12 w-12 md:h-9 md:w-9"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Button
              aria-label="Search"
              variant="ghost"
              size="icon"
              className="h-12 w-12 md:h-9 md:w-9"
              onClick={() => setIsSearchOpen((value) => !value)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-center pb-2 sm:pb-3" aria-label="Shuru logo">
            <Link href={`/${locale}`} className="inline-flex items-center justify-center">
              <ThemeLogo
                lightLogoUrl={lightLogoUrl}
                darkLogoUrl={darkLogoUrl}
                alt={logoAlt}
                className="h-14 w-auto pb-1 object-contain sm:h-16 lg:h-20 max-w-[240px] sm:max-w-[300px] lg:max-w-[400px]"
                priority={true}
                width={640}
                height={410}
                sizes="(max-width: 640px) 90px, (max-width: 1024px) 100px, 142px"
                quality={85}
              />
            </Link>
          </div>

          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-12 md:h-9 px-2 text-xs sm:px-3 sm:text-sm flex items-center gap-1.5 rounded-xl border border-transparent transition-all cursor-pointer",
                user
                  ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-bold"
                  : "hover:border-border"
              )}
              onClick={() => router.push(user ? `/${locale}/profile` : `/${locale}/auth/login`)}
              aria-label={user ? "Profile" : "Login"}
            >
              <User className="h-4 w-4" />
              {user && <span className="hidden md:inline font-bold text-xs">{user.username}</span>}
            </Button>

            <ModeToggle />
            <LocaleSwitcher currentLocale={locale} />
          </div>
        </div>

        <div
          className={cn(
            "flex overflow-visible border-t border-border/70 transition-all duration-300 items-end justify-center",
            isScrolled && !isHovered ? "max-h-0 opacity-0" : "max-h-[200px] pt-2 opacity-100"
          )}
        >
          <ul className="flex flex-row flex-wrap items-end justify-center gap-x-3 gap-y-1 text-sm">
            {headerItems.map((item) => {
              const hasSubItems = item.subItems.length > 0;

              return (
                <li
                  key={`${item.label}-${item.url}`}
                  className="header-dropdown-item relative border-b-2 border-transparent transition-colors duration-300 hover:border-primary"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {hasSubItems ? (
                    <button
                      className="inline-flex min-h-11 items-center gap-1 px-2 py-1 text-foreground transition-colors hover:text-primary"
                      onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          openDropdown === item.label ? "rotate-180" : "rotate-0"
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={toLocaleAwareUrl(item.url, locale)}
                      {...getLinkProps(item.openInNewTab)}
                      className="inline-flex min-h-11 items-center px-2 py-1 text-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  )}

                  {hasSubItems ? (
                    <div
                      className={cn(
                        "absolute start-1/2 top-[calc(100%+0.4rem)] z-50 w-64 ltr:-translate-x-1/2 rtl:translate-x-1/2 rounded-lg border border-border bg-popover/95 shadow-xl backdrop-blur transition-all duration-500",
                        openDropdown === item.label
                          ? "visible translate-y-0 opacity-100"
                          : "invisible -translate-y-1 opacity-0 pointer-events-none"
                      )}
                    >
                      <div className="py-2">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={`${subItem.label}-${subItem.url}`}
                            href={toLocaleAwareUrl(subItem.url, locale)}
                            {...getLinkProps(subItem.openInNewTab)}
                            className="flex min-h-11 items-center px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-primary"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        locale={locale}
        items={items}
        latestMagazine={latestMagazine}
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        locale={locale}
        items={items}
      />
    </>
  );
}