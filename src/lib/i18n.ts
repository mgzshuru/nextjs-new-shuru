export const locales = ["en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localePrefix = "always" as const;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (process.env.NODE_ENV === "production" ? "https://shuru.sa" : "http://localhost:3000");

export const localeCookie = "locale";

export const rtlLocales = new Set<Locale>(["ar"]);

export const languageLabels: Record<Locale, string> = {
  en: "En",
  ar: "Ar",
};

export const hrefLang: Record<Locale, string> = {
  en: "en",
  ar: "ar",
};

export const isLocale = (value: string | null | undefined): value is Locale =>
  locales.includes(value as Locale);

export const getDirection = (locale: Locale) =>
  rtlLocales.has(locale) ? "rtl" : "ltr";