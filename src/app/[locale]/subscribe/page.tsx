import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SubscribeForm } from "@/components/page/subscribe-form";
import { locales, isLocale, defaultLocale, siteUrl, type Locale } from "@/lib/i18n";
import { getGlobalSettings } from "@/strapi/global";

type SubscribePageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: SubscribePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "subscribe" });
  const globalData = await getGlobalSettings(locale);

  const siteName = globalData?.siteName || "Shuru";
  const title = `${t("title")} | ${siteName}`;
  const description = t("description");

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/subscribe`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/subscribe`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SubscribePage({ params }: SubscribePageProps) {
  const { locale } = await params;
  
  if (!isLocale(locale)) {
    return null;
  }
  
  setRequestLocale(locale);
  const t = await getTranslations("subscribe");

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-20 px-4 overflow-hidden">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-1/4 start-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 end-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="bg-card/70 backdrop-blur-md border border-border/60 p-8 md:p-12 rounded-3xl shadow-xl hover:shadow-2xl hover:border-border/80 transition-all duration-500">
          <div className="mb-8 text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/75 bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              {t("description")}
            </p>
          </div>
          <SubscribeForm />
        </div>
      </div>
    </div>
  );
}
