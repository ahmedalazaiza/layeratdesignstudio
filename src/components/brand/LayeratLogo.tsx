import React, { useEffect, useState } from "react";

export interface BrandLogosConfig {
  logoLightUrl?: string;
  logoDarkUrl?: string;
  iconLightUrl?: string;
  iconDarkUrl?: string;
  brandName?: string;
  brandTagline?: string;
}

export const DEFAULT_BRAND_LOGOS: BrandLogosConfig = {
  logoLightUrl: "/brand/logo-light-mode.png",
  logoDarkUrl: "/brand/logo-dark-mode.png",
  iconLightUrl: "/brand/icon-light-mode.png",
  iconDarkUrl: "/brand/icon-dark-mode.png",
  brandName: "LAYERAT",
  brandTagline: "DESIGN STUDIO",
};

/**
 * Hook to retrieve active brand logo assets from localStorage / CMS
 */
export function useBrandLogos() {
  const [config, setConfig] = useState<BrandLogosConfig>(() => {
    try {
      const saved = localStorage.getItem("ld_brand_logos");
      if (saved) return { ...DEFAULT_BRAND_LOGOS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_BRAND_LOGOS;
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem("ld_brand_logos");
        if (saved) setConfig({ ...DEFAULT_BRAND_LOGOS, ...JSON.parse(saved) });
      } catch {}
    };

    window.addEventListener("layerat_brand_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("layerat_brand_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return config;
}

interface LogoProps {
  isDark?: boolean;
  className?: string;
  iconOnly?: boolean;
  height?: number | string;
  alt?: string;
}

/**
 * Pure Vector SVG Icon (3 dynamic stacked Layerat bars)
 */
export function LayeratIconSvg({
  color,
  isDark,
  className = "",
  size = 28,
}: {
  color?: string;
  isDark?: boolean;
  className?: string;
  size?: number | string;
}) {
  const hasExplicitDark = typeof isDark === "boolean";
  const barFill = color || (hasExplicitDark ? (isDark ? "#aaff38" : "#1a4d22") : undefined);

  return (
    <svg
      viewBox="0 0 106 100"
      width={size}
      height={size}
      fill={barFill}
      className={`${hasExplicitDark || color ? "" : "fill-[#1a4d22] dark:fill-[#aaff38]"} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Bar (Shifted Right) */}
      <rect x="20" y="4" width="82" height="24" rx="4" />
      {/* Middle Bar (Shifted Left) */}
      <rect x="4" y="38" width="82" height="24" rx="4" />
      {/* Bottom Bar (Shifted Right) */}
      <rect x="16" y="72" width="82" height="24" rx="4" />
    </svg>
  );
}

/**
 * Pure Vector SVG Full Logo (Mark + Typography)
 */
export function LayeratLogoSvg({
  isDark,
  className = "",
  height = 36,
}: {
  isDark?: boolean;
  className?: string;
  height?: number | string;
}) {
  const hasExplicitDark = typeof isDark === "boolean";
  const barFill = hasExplicitDark
    ? isDark
      ? "#aaff38"
      : "#1a4d22"
    : undefined;
  const titleFill = hasExplicitDark
    ? isDark
      ? "#ffffff"
      : "#080c09"
    : undefined;
  const subtitleFill = hasExplicitDark
    ? isDark
      ? "rgba(255,255,255,0.7)"
      : "rgba(8,12,9,0.7)"
    : undefined;

  return (
    <svg
      viewBox="0 0 450 100"
      height={height}
      className={`overflow-visible select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Layerat 3-Layer Mark */}
      <g
        fill={barFill}
        className={hasExplicitDark ? "" : "fill-[#1a4d22] dark:fill-[#aaff38]"}
      >
        <rect x="20" y="4" width="82" height="24" rx="4" />
        <rect x="4" y="38" width="82" height="24" rx="4" />
        <rect x="16" y="72" width="82" height="24" rx="4" />
      </g>

      {/* Typography: LAYERAT */}
      <text
        x="122"
        y="60"
        fill={titleFill}
        className={hasExplicitDark ? "" : "fill-[#080c09] dark:fill-[#ffffff]"}
        fontFamily="Outfit, Inter, system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="64"
        letterSpacing="0.04em"
      >
        LAYERAT
      </text>

      {/* Typography: DESIGN STUDIO */}
      <text
        x="124"
        y="92"
        fill={subtitleFill}
        className={hasExplicitDark ? "" : "fill-[#4a6a50] dark:fill-[rgba(255,255,255,0.7)]"}
        fontFamily="Outfit, Inter, system-ui, -apple-system, sans-serif"
        fontWeight="300"
        fontSize="22"
        letterSpacing="0.26em"
      >
        DESIGN STUDIO
      </text>
    </svg>
  );
}

/**
 * Official Adaptive Layerat Brand Logo Component
 * Automatically switches between custom CMS images or crisp vector SVGs
 */
export function LayeratLogo({
  isDark,
  className = "",
  iconOnly = false,
  height = 32,
  alt = "Layerat Design Studio",
}: LogoProps) {
  const brand = useBrandLogos();

  const resolvedIsDark =
    typeof isDark === "boolean"
      ? isDark
      : typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark");

  if (iconOnly) {
    const customIcon = resolvedIsDark ? brand.iconDarkUrl : brand.iconLightUrl;
    if (customIcon && customIcon.length > 5 && !customIcon.startsWith("/brand/")) {
      return (
        <img
          src={customIcon}
          alt={alt}
          style={{ height }}
          className={`object-contain ${className}`}
        />
      );
    }

    return (
      <LayeratIconSvg
        isDark={isDark}
        size={height}
        className={className}
      />
    );
  }

  const customLogo = resolvedIsDark ? brand.logoDarkUrl : brand.logoLightUrl;
  if (customLogo && customLogo.length > 5 && !customLogo.startsWith("/brand/")) {
    return (
      <img
        src={customLogo}
        alt={alt}
        style={{ height }}
        className={`object-contain ${className}`}
      />
    );
  }

  return (
    <LayeratLogoSvg
      isDark={isDark}
      height={height}
      className={className}
    />
  );
}
