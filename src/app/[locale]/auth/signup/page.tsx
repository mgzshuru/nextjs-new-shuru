import { getTranslations, setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import SignupPageClient from "./signup-client";

type SignupPageProps = Readonly<{
  params: Promise<{ locale: Locale }>;
}>;

export async function generateMetadata({ params }: SignupPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return buildMetadata({
    locale,
    path: "/auth/signup",
    title: t("signup") || "Sign Up",
    noIndex: true,
  });
}

export default async function SignupPage({ params }: SignupPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SignupPageClient params={Promise.resolve({ locale })} />;
}
