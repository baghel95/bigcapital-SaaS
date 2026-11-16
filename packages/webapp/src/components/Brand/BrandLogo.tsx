import React from 'react';
import { BRAND } from '@/constants/brand';

interface BrandMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Ganak mark: an indigo tile with a "G" whose crossbar reads as a ledger line.
 */
export function BrandMark({ size = 32, ...props }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={BRAND.name}
      {...props}
    >
      <rect width="32" height="32" rx="8" fill={BRAND.colors.primary} />
      <path
        d="M22.6 11.4A7.6 7.6 0 1 0 23.6 16H16.4"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="23.6" cy="22.4" r="1.9" fill={BRAND.colors.accent} />
    </svg>
  );
}

interface BrandLogoProps {
  /** Height of the mark in px; the wordmark scales with it. */
  height?: number;
  className?: string;
  showName?: boolean;
  /** White wordmark for dark backgrounds. */
  inverse?: boolean;
}

/** Mark plus wordmark, laid out inline. */
export function BrandLogo({
  height = 32,
  className,
  showName = true,
  inverse = false,
}: BrandLogoProps) {
  return (
    <span
      className={['g-brand-logo', className].filter(Boolean).join(' ')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.round(height * 0.3),
      }}
    >
      <BrandMark size={height} />
      {showName && (
        <span
          className="g-brand-logo__name"
          style={{
            fontSize: Math.round(height * 0.72),
            fontWeight: 650,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: inverse ? '#ffffff' : 'var(--g-text, #0f172a)',
          }}
        >
          {BRAND.name}
        </span>
      )}
    </span>
  );
}
