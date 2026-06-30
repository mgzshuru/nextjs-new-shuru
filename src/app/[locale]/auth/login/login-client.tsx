'use client';

import { use, useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { loginAction } from '@/lib/actions/auth';
import { getStrapiBaseUrl } from '@/lib/strapi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const createLoginSchema = (t: any) =>
  zod.object({
    identifier: zod.string().min(1, t('validation.required')),
    password: zod.string().min(6, t('validation.minLength', { min: 6 })),
  });

type LoginFormValues = zod.infer<ReturnType<typeof createLoginSchema>>;

function LoginFormContent({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [authError, setAuthError] = useState<string | null>(null);

  const loginSchema = createLoginSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setAuthError(null);
    startTransition(async () => {
      const result = await loginAction(values);
      if (result.success) {
        toast.success(t('auth.successProfileUpdate') || 'Welcome back!');
        const redirectTo = searchParams.get('redirect') || `/${locale}/profile`;
        router.push(redirectTo);
        router.refresh();
      } else {
        const errorMsg = result.error || 'Invalid credentials';
        setAuthError(errorMsg);
        toast.error(errorMsg);
      }
    });
  };

  const handleSocialLogin = (provider: 'google' | 'linkedin') => {
    const strapiUrl = getStrapiBaseUrl();
    window.location.href = `${strapiUrl}/api/connect/${provider}`;
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background/95 to-card/30">
      <Card className="w-full max-w-md border-border/50 shadow-2xl backdrop-blur-md bg-card/65 rounded-3xl overflow-hidden">
        <CardHeader className="space-y-2 text-center pt-8">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
            {t('auth.login')}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {t('insights.tabs.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {authError && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium animate-shake">
                {authError}
              </div>
            )}

            <div className="space-y-1.5 text-start">
              <Label htmlFor="identifier" className="text-xs font-bold text-foreground/80 uppercase">
                {t('auth.email')} / {t('auth.username')}
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="you@example.com"
                className="rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary h-11"
                disabled={isPending}
                {...register('identifier')}
              />
              {errors.identifier && (
                <p className="text-xs font-semibold text-destructive mt-1">{errors.identifier.message}</p>
              )}
            </div>

            <div className="space-y-1.5 text-start">
              <Label htmlFor="password" className="text-xs font-bold text-foreground/80 uppercase">
                {t('auth.password')}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary h-11"
                {...register('password')}
                disabled={isPending}
              />
              {errors.password && (
                <p className="text-xs font-semibold text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 mt-6"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin me-2" />
                  {t('auth.updating')}
                </>
              ) : (
                t('auth.login')
              )}
            </Button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border/40"></div>
            <span className="flex-shrink mx-4 text-xs text-muted-foreground font-medium uppercase tracking-wider select-none">
              {t('auth.orSignInWith')}
            </span>
            <div className="flex-grow border-t border-border/40"></div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              className="rounded-xl border-border/60 hover:bg-accent/40 h-11 text-xs font-semibold flex items-center justify-center gap-2"
              disabled={isPending}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin('linkedin')}
              className="rounded-xl border-border/60 hover:bg-accent/40 h-11 text-xs font-semibold flex items-center justify-center gap-2"
              disabled={isPending}
            >
              <svg className="w-4 h-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              linkedin
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center pb-8 border-t border-border/30 pt-4 bg-muted/20">
          <p className="text-xs text-muted-foreground font-medium">
            {t('auth.orSignUpWith')}?{' '}
            <Link
              href={`/${locale}/auth/signup`}
              className="text-primary hover:underline font-bold transition-all"
            >
              {t('auth.signup')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);

  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <LoginFormContent locale={locale} />
    </Suspense>
  );
}
