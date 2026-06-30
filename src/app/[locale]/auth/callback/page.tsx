import { setRequestLocale } from "next-intl/server";
import { type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import CallbackPageClient from "./callback-client";

type CallbackPageProps = Readonly<{
  params: Promise<{ locale: Locale }>;
}>;

export async function generateMetadata({ params }: CallbackPageProps) {
  const { locale } = await params;
  return buildMetadata({
    locale,
    path: "/auth/callback",
    title: "Authentication Callback",
    noIndex: true,
  });
}

export default async function AuthCallbackPage({ params }: CallbackPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CallbackPageClient params={Promise.resolve({ locale })} />;
}
