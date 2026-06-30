import { getGlobalSettings } from "@/strapi/global";
import { locales, hrefLang, defaultLocale, siteUrl, type Locale } from "@/lib/i18n";
import { toAbsoluteUrl } from "@/lib/strapi";
import type { Metadata } from "next";

export interface BuildMetadataOptions {
  locale: Locale;
  path: string; // e.g. "/insights/articles" or "/contact"
  title?: string;
  description?: string;
  ogImage?: {
    url?: string | null;
    width?: number;
    height?: number;
    alt?: string | null;
  } | null;
  type?: "website" | "article" | "profile";
  keywords?: string[];
  noIndex?: boolean;
}

export async function buildMetadata({
  locale,
  path,
  title,
  description,
  ogImage,
  type = "website",
  keywords,
  noIndex = false,
}: BuildMetadataOptions): Promise<Metadata> {
  const globalData = await getGlobalSettings(locale);
  const siteName = globalData?.siteName || "Shuru";

  // Strip leading and trailing slashes for clean prefix matching
  const cleanPath = path.replace(/^\/|\/$/g, "");
  
  // Form canonical and localized link alternates
  const canonicalUrl = cleanPath ? `/${locale}/${cleanPath}` : `/${locale}`;

  const languages = Object.fromEntries(
    locales.map((lang) => {
      const localizedPath = cleanPath ? `/${lang}/${cleanPath}` : `/${lang}`;
      return [hrefLang[lang], localizedPath];
    })
  );

  const finalTitle = title ? title : (globalData?.seoTitle || siteName);
  const finalDescription = description || globalData?.seoDescription || globalData?.siteDescription || "";

  const ogImageUrl = toAbsoluteUrl(ogImage?.url) || globalData?.ogImage?.url || undefined;

  const robots = noIndex ? { index: false, follow: false } : undefined;

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: keywords || (globalData?.seoKeywords ? globalData.seoKeywords.split(",").map((kw) => kw.trim()) : undefined),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ...languages,
        "x-default": cleanPath ? `/${defaultLocale}/${cleanPath}` : `/${defaultLocale}`,
      },
    },
    openGraph: {
      url: `${siteUrl}${canonicalUrl}`,
      locale,
      title: finalTitle,
      description: finalDescription,
      type,
      siteName,
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: ogImage?.width || globalData?.ogImage?.width || undefined,
              height: ogImage?.height || globalData?.ogImage?.height || undefined,
              alt: ogImage?.alt || globalData?.ogImage?.alternativeText || finalTitle,
            },
          ]
        : undefined,
    },
    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title: finalTitle,
      description: finalDescription,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
    robots,
  };
}
