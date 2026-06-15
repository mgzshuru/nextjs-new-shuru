'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { locales, languageLabels, type Locale } from '@/lib/i18n';
import { setLocale } from '@/lib/locale-actions';
import { usePathname } from 'next/navigation';

interface LocaleSwitcherProps {
  currentLocale: Locale;
}

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = React.useTransition();

  // Find the next locale to switch to
  const currentIndex = locales.indexOf(currentLocale);
  const nextLocale = locales[(currentIndex + 1) % locales.length];

  const buildLocalizedPath = React.useCallback(
    (targetLocale: Locale) => {
      const segments = pathname.split('/').filter(Boolean);
      const [, ...rest] = segments;
      return `/${[targetLocale, ...rest].join('/')}`;
    },
    [pathname]
  );

  const handleToggle = () => {
    startTransition(async () => {
      await setLocale(nextLocale);
      window.location.href = buildLocalizedPath(nextLocale);
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 min-w-[2.5rem] px-2 text-xs font-semibold tracking-wide"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={`Switch to ${languageLabels[nextLocale]}`}
    >
      {languageLabels[nextLocale]}
    </Button>
  );
}
