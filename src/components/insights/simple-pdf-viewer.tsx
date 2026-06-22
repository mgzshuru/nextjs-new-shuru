'use client';

import React, { useState, useEffect } from 'react';
import { DownloadPdfButton } from '@/components/ui/download-pdf-button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface SimplePdfViewerProps {
  pdfUrl: string;
  magazineTitle: string;
  magazineSlug: string;
  downloadUrl?: string;
}

export function SimplePdfViewer({
  pdfUrl,
  magazineTitle,
  magazineSlug,
  downloadUrl,
}: SimplePdfViewerProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isRtl = locale === 'ar';
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) || 
        (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
      setIsIOS(isIOSDevice);
    }
  }, []);

  const backLabel = isRtl ? 'رجوع' : 'Back';
  const downloadLabel = isRtl ? 'تحميل' : 'Download';
  const loadingLabel = isRtl ? 'جاري التحميل...' : 'Downloading...';

  return (
    <div className="flex flex-col h-dvh w-full bg-neutral-900 text-white font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-neutral-700 select-none">
        <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
          <Link
            href={`/${locale}/insights/magazine/${magazineSlug}`}
            className="p-2 hover:bg-neutral-700 rounded-full transition-colors inline-flex items-center justify-center shrink-0"
            title={backLabel}
          >
            {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Link>
          <h1 className="text-sm md:text-base font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-xl text-neutral-100">
            {magazineTitle}
          </h1>
        </div>
        
        {downloadUrl && (
          <DownloadPdfButton
            pdfUrl={downloadUrl}
            fileName={`${magazineSlug}.pdf`}
            className="inline-flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:scale-[0.98] px-4 py-1.5 text-xs md:text-sm font-bold transition-all shrink-0"
            loadingText={loadingLabel}
          >
            {downloadLabel}
          </DownloadPdfButton>
        )}
      </header>
      
      {/* PDF Container */}
      <div className="flex-1 w-full bg-neutral-950 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        {isIOS ? (
          <div className="max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100 mb-2">
                {isRtl ? "عرض ملف المجلة" : "View Magazine PDF"}
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {isRtl 
                  ? "يتطلب نظام iOS فتح مستندات PDF في نافذة مستقلة لتصفح الصفحات كاملة."
                  : "iOS Safari requires PDF documents to be opened in a separate window to view all pages."}
              </p>
            </div>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 active:scale-[0.98] px-6 py-3 font-bold transition-all"
            >
              {isRtl ? "فتح في علامة تبويب جديدة" : "Open in New Tab"}
            </a>
          </div>
        ) : (
          <iframe
            src={`${pdfUrl}#toolbar=1`}
            className="w-full h-full border-none"
            title={magazineTitle}
          />
        )}
      </div>
    </div>
  );
}
