import Image from "next/image";

type ThemeLogoProps = {
  lightLogoUrl: string | null;
  darkLogoUrl: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
};

/**
 * Renders both logo variants server-side and uses CSS dark-mode classes to
 * show the correct one — no JS/useState/useEffect needed, which eliminates
 * the hydration flash that was delaying LCP.
 */
export function ThemeLogo({
  lightLogoUrl,
  darkLogoUrl,
  alt,
  className = "",
  width = 400,
  height = 120,
  priority = false,
  sizes,
  quality = 75,
}: ThemeLogoProps) {
  // If neither logo is available, render a text fallback.
  if (!lightLogoUrl && !darkLogoUrl) {
    return <span className="text-lg font-semibold tracking-wide">Shuru</span>;
  }

  // If only one logo is provided, use it for both themes.
  const effectiveLightUrl = lightLogoUrl || darkLogoUrl;
  const effectiveDarkUrl = darkLogoUrl || lightLogoUrl;

  // Both images are the same — just render once.
  if (effectiveLightUrl === effectiveDarkUrl) {
    return (
      <Image
        src={effectiveLightUrl!}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        sizes={sizes}
        quality={quality}
      />
    );
  }

  // Render both server-side; CSS dark class controls visibility.
  // This avoids any JS-dependent render and prevents the LCP flash.
  // suppressHydrationWarning is required because next/image can generate
  // slightly different srcSet/className attributes between SSR and hydration
  // for theme-dependent images — the visual result is identical.
  return (
    <>
      {/* Light logo: visible in light mode, hidden in dark mode */}
      <Image
        src={effectiveLightUrl!}
        alt={alt}
        width={width}
        height={height}
        className={`${className} dark:hidden`}
        priority={priority}
        sizes={sizes}
        quality={quality}
        suppressHydrationWarning
      />
      {/* Dark logo: hidden in light mode, visible in dark mode */}
      <Image
        src={effectiveDarkUrl!}
        alt={alt}
        width={width}
        height={height}
        className={`${className} hidden dark:block`}
        priority={priority}
        sizes={sizes}
        quality={quality}
        suppressHydrationWarning
      />
    </>
  );
}
