import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"

import { DirectionProvider } from "@/components/ui/direction"
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from "next-intl/server";
import { getDirection } from "@/lib/i18n";
import { defaultLocale, isLocale, siteUrl, type Locale } from "@/lib/i18n";
import { getGlobalSettings } from "@/strapi/global";
import { getHeaderSettings } from "@/strapi/header";
import { getOptimizedOgImageUrl } from "@/lib/seo";


const fontSans = localFont({
  src: [
    { path: "../../public/fonts/Bahij_TheSansArabic-Light.woff2",    weight: "300" },
    { path: "../../public/fonts/Bahij_TheSansArabic-Plain.woff2",    weight: "400" },
    { path: "../../public/fonts/Bahij_TheSansArabic-SemiBold.woff2", weight: "600" },
    { path: "../../public/fonts/Bahij_TheSansArabic-Bold.woff2",     weight: "700" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestedLocale = await getLocale();
  const locale: Locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const [globalData, headerData] = await Promise.all([
    getGlobalSettings(locale),
    getHeaderSettings(locale),
  ]);

  const siteName = globalData?.seoTitle?.trim() || globalData?.siteName?.trim() || "Shuru";
  const description = globalData?.seoDescription || globalData?.siteDescription || "Shuru multilingual platform.";
  const keywords = globalData?.seoKeywords ? globalData.seoKeywords.split(",").map((kw) => kw.trim()) : undefined;
  const ogImage = globalData?.ogImage;
  const ogImageUrl = ogImage?.url ?? undefined;
  const logoUrl = headerData?.darkLogoUrl || headerData?.lightLogoUrl;
  const finalOgImageUrl = getOptimizedOgImageUrl(ogImageUrl, siteName, description, locale, logoUrl);
  const isOptimized = finalOgImageUrl && finalOgImageUrl.includes("/api/og");

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: keywords,
    authors: siteName ? [{ name: siteName }] : undefined,
    creator: siteName || undefined,
    publisher: siteName,
    category: "business",
    classification: "Business & Professional",
    openGraph: {
      title: siteName,
      description,
      type: "website",
      siteName,
      images: finalOgImageUrl
        ? [{
            url: finalOgImageUrl,
            width: isOptimized ? 1200 : (ogImage?.width ?? undefined),
            height: isOptimized ? 630 : (ogImage?.height ?? undefined),
            alt: ogImage?.alternativeText ?? undefined
          }]
        : undefined,
    },
    twitter: {
      card: finalOgImageUrl ? "summary_large_image" : "summary",
      title: siteName,
      description,
      images: finalOgImageUrl ? [finalOgImageUrl] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestedLocale = await getLocale();
  const locale: Locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const messages = await getMessages();

  return (
    <html lang={locale} dir={getDirection(locale)} suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} antialiased min-h-dvh flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <DirectionProvider dir={getDirection(locale)}>
              {children}
            </DirectionProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
