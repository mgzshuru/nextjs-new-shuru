'use client';

import { useEffect, useState, Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeOAuthTokenAction } from '@/lib/actions/auth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CallbackContentProps {
  locale: string;
}

function CallbackContent({ locale }: CallbackContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const errorMsg = searchParams.get('error') || searchParams.get('message');
    
    // Auto-detect provider
    let provider = searchParams.get('provider');
    if (!provider) {
      const idToken = searchParams.get('id_token');
      if (idToken) {
        try {
          const payloadPart = idToken.split('.')[1];
          if (payloadPart) {
            const decoded = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')));
            if (decoded.iss?.includes('google')) {
              provider = 'google';
            } else if (decoded.iss?.includes('linkedin')) {
              provider = 'linkedin';
            }
          }
        } catch (e) {
          console.error('Error decoding ID token:', e);
        }
      }
      
      // Fallback detection using token prefix
      if (!provider) {
        provider = accessToken?.startsWith('ya29.') ? 'google' : 'linkedin';
      }
    }

    if (errorMsg) {
      setError(errorMsg);
      toast.error(`Authentication error: ${errorMsg}`);
      setTimeout(() => router.push(`/${locale}/auth/login`), 2000);
      return;
    }

    if (!accessToken) {
      setError('No access token found.');
      toast.error('Authentication failed: Missing access token');
      setTimeout(() => router.push(`/${locale}/auth/login`), 2000);
      return;
    }

    async function handleExchange() {
      const res = await exchangeOAuthTokenAction(provider!, accessToken!);
      if (res.success) {
        toast.success('Logged in successfully!');
        router.push(`/${locale}/profile`);
      } else {
        setError(res.error || 'Failed to initialize session');
        toast.error(res.error || 'Session initialization failed');
        setTimeout(() => router.push(`/${locale}/auth/login`), 2500);
      }
    }

    handleExchange();
  }, [searchParams, router, locale]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        {error ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground">Authentication Failed</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground/70">Redirecting you to login page...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Completing Sign In</h1>
            <p className="text-sm text-muted-foreground animate-pulse">Securing your session and loading your profile...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);

  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <CallbackContent locale={locale} />
    </Suspense>
  );
}
