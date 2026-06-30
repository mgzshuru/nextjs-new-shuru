import { setRequestLocale, getTranslations } from "next-intl/server";
import { ConsultationForm } from "@/components/page/consultation-form";
import { locales, type Locale, isLocale, defaultLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

type ConsultationPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: ConsultationPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "consultation" });
  return buildMetadata({
    locale,
    path: "/consultation",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ConsultationPage({ params }: ConsultationPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("consultation");

  return (
    <div className="container mx-auto px-4 py-24 pb-32 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{t("title")}</h1>
        <p className="text-muted-foreground text-lg">{t("description")}</p>
      </div>
      <div className="bg-card p-6 md:p-8 rounded-xl shadow-sm border border-border">
        <ConsultationForm />
      </div>
    </div>
  );
}
