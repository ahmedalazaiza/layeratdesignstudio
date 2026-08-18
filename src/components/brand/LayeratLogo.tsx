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
  className = "",
  size = 28,
}: {
  color?: string;
  className?: string;
  size?: number | string;
}) {
  return (
    <svg
      viewBox="0 0 106 100"
      width={size}
      height={size}
      fill={color || "currentColor"}
      className={className}
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
  isDark = true,
  className = "",
  height = 36,
}: {
  isDark?: boolean;
  className?: string;
  height?: number | string;
}) {
  const barColor = isDark ? "#aaff38" : "#123616";
  const titleColor = isDark ? "#ffffff" : "#0f172a";
  const subtitleColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.7)";

  return (
    <svg
      viewBox="0 0 450 100"
      height={height}
      className={`overflow-visible select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Layerat 3-Layer Mark */}
      <g fill={barColor}>
        <rect x="20" y="4" width="82" height="24" rx="4" />
        <rect x="4" y="38" width="82" height="24" rx="4" />
        <rect x="16" y="72" width="82" height="24" rx="4" />
      </g>

      {/* Typography: LAYERAT */}
      <text
        x="122"
        y="60"
        fill={titleColor}
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
        fill={subtitleColor}
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
  isDark = true,
  className = "",
  iconOnly = false,
  height = 32,
  alt = "Layerat Design Studio",
}: LogoProps) {
  const brand = useBrandLogos();

  if (iconOnly) {
    const customIcon = isDark ? brand.iconDarkUrl : brand.iconLightUrl;
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
        color={isDark ? "#aaff38" : "#123616"}
        size={height}
        className={className}
      />
    );
  }

  const customLogo = isDark ? brand.logoDarkUrl : brand.logoLightUrl;
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
