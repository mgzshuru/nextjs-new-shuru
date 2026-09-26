'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBreadcrumb } from '@/components/shared/breadcrumb-context';

interface DynamicBreadcrumbProps {
  locale: string;
}

export function DynamicBreadcrumb({ locale }: DynamicBreadcrumbProps) {
  const pathname = usePathname();
  const { titles } = useBreadcrumb();
  const isRtl = locale === 'ar';

  // Remove locale prefix from path, e.g. "/en/insights/categories" -> "insights/categories"
  let pathWithoutLocale = pathname;
  if (pathname === `/${locale}`) {
    pathWithoutLocale = '';
  } else if (pathname.startsWith(`/${locale}/`)) {
    pathWithoutLocale = pathname.substring(locale.length + 2);
  } else if (pathname.startsWith('/')) {
    pathWithoutLocale = pathname.substring(1);
  }

  if (!pathWithoutLocale) {
    return null; // Don't show breadcrumb on home page
  }

  const segments = pathWithoutLocale.split('/').filter(Boolean);

  // Map of static segment translations
  const dictionary: Record<string, { en: string, ar: string }> = {
    'insights': { en: 'Insights', ar: 'الرؤى' },
    'categories': { en: 'Categories', ar: 'الفئات' },
    'articles': { en: 'Articles', ar: 'المقالات' },
    'contact': { en: 'Contact Us', ar: 'تواصل معنا' },
    'about': { en: 'About Us', ar: 'من نحن' },
    'about-us': { en: 'About Us', ar: 'من نحن' },
    'experts': { en: 'Experts', ar: 'الخبراء' },
    'request-info': { en: 'Request Information', ar: 'طلب معلومات' },
    'services': { en: 'Services', ar: 'الخدمات' },
    'methodology': { en: 'Methodology', ar: 'المنهجية' },
    'solutions': { en: 'Solutions', ar: 'الحلول' },
    'shuru': { en: 'Shuru', ar: 'شروع' },
    'company-profile': { en: 'Company Profile', ar: 'الملف التعريفي' },
    'terms': { en: 'Terms & Conditions', ar: 'الشروط والأحكام' },
    'privacy': { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
    'success-stories': { en: 'Success Stories', ar: 'قصص النجاح' },
    'magazine': { en: 'Publications', ar: 'الإصدارات' },
    'majlis': { en: 'Majlis', ar: 'المجلس' },
    'news': { en: 'News', ar: 'الأخبار' },
    'podcasts': { en: 'Podcasts', ar: 'البودكاست' },
    'subscribe': { en: 'Subscribe', ar: 'الاشتراك' },
    'consultation': { en: 'Consultation', ar: 'طلب استشارة' },
    'auth': { en: 'Login', ar: 'تسجيل الدخول' },
    'login': { en: 'Login', ar: 'تسجيل الدخول' },
    'signup': { en: 'Sign Up', ar: 'إنشاء حساب' },
    'profile': { en: 'Profile', ar: 'الملف الشخصي' },
    'read': { en: 'Read', ar: 'قراءة' }
  };

  const getSegmentName = (segment: string) => {
    const decodedSegment = decodeURIComponent(segment);
    // Check dictionary
    if (dictionary[decodedSegment]) {
      return dictionary[decodedSegment][locale as 'en' | 'ar'] || decodedSegment;
    }
    // Handle slugs visually (capitalize and replace hyphens)
    return decodedSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .substring(0, 30) + (decodedSegment.length > 30 ? '...' : '');
  };

  const buildPath = (index: number) => {
    const route = segments.slice(0, index + 1).join('/');
    return `/${locale}/${route}`;
  };

  return (
    <div className="container mx-auto px-4 py-4 mt-top">
      <Breadcrumb dir={isRtl ? 'rtl' : 'ltr'}>
        <BreadcrumbList>
          {/* Home Link */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${locale}`} aria-label={locale === 'ar' ? 'الرئيسية' : 'Home'}>
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const path = buildPath(index);
            const name = titles[path] || getSegmentName(segment);

            return (
              <React.Fragment key={path}>
                <BreadcrumbSeparator>
                  {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-semibold text-primary">{name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={path}>{name}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
