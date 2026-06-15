import React from "react";
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
};

export function ThemeLogo({
  lightLogoUrl,
  darkLogoUrl,
  alt,
  className = "",
  width = 400,
  height = 120,
  priority = false,
  sizes,
}: ThemeLogoProps) {
  if (!lightLogoUrl && !darkLogoUrl) {
    return <span className="text-lg font-semibold tracking-wide">Shuru</span>;
  }

  // If we only have one logo, use it for both themes
  const effectiveLightUrl = lightLogoUrl || darkLogoUrl;
  const effectiveDarkUrl = darkLogoUrl || lightLogoUrl;

  return (
    <>
      {effectiveLightUrl && (
        <Image
          src={effectiveLightUrl}
          alt={alt}
          width={width}
          height={height}
          className={`${className} dark:hidden`}
          priority={priority}
          sizes={sizes}
        />
      )}
      {effectiveDarkUrl && (
        <Image
          src={effectiveDarkUrl}
          alt={alt}
          width={width}
          height={height}
          className={`${className} hidden dark:block`}
          priority={priority}
          sizes={sizes}
        />
      )}
    </>
  );
}
