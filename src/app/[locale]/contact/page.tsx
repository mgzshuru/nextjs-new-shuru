import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/page/contact-form";
import { buildMetadata } from "@/lib/seo";
import { type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildMetadata({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ContactUsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="container mx-auto px-4 py-24 pb-32 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{t("title")}</h1>
        <p className="text-muted-foreground text-lg">{t("description")}</p>
      </div>
      <div className="bg-card p-6 md:p-8 rounded-xl shadow-sm border border-border">
        <ContactForm />
      </div>
    </div>
  );
}
