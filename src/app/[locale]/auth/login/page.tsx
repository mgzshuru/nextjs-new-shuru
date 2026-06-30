import { getTranslations, setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import LoginPageClient from "./login-client";

type LoginPageProps = Readonly<{
  params: Promise<{ locale: Locale }>;
}>;

export async function generateMetadata({ params }: LoginPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return buildMetadata({
    locale,
    path: "/auth/login",
    title: t("login") || "Login",
    noIndex: true,
  });
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LoginPageClient params={Promise.resolve({ locale })} />;
}
