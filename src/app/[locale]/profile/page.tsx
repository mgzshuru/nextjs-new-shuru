import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { type Locale } from '@/lib/i18n';
import { getMe } from '@/lib/actions/auth';
import { getSavedInsightsAction } from '@/lib/actions/saved-insights';
import { ProfileClient } from '@/components/profile/profile-client';
import { buildMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return buildMetadata({
    locale,
    path: '/profile',
    title: t('profile') || 'User Profile',
    description: 'Manage your bookmarks and contact settings.',
    noIndex: true,
  });
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Retrieve user session
  const session = await getMe();
  if (!session) {
    // Should be handled by middleware, but fallback to 404/notFound just in case
    notFound();
  }

  // Load saved insights
  const savedInsights = await getSavedInsightsAction(locale);

  return (
    <main className="flex-1 bg-background">
      <ProfileClient
        user={session.user}
        savedInsights={savedInsights}
        locale={locale}
      />
    </main>
  );
}
