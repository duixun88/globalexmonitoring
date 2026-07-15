import React from 'react';
import 'flag-icons/css/flag-icons.min.css';

interface FlagProps {
  /** ISO 3166-1 alpha-2 country code, lowercase (e.g. 'kr', 'us'). */
  cc: string;
  /** Tailwind size classes; defaults to a compact rectangle. */
  className?: string;
  title?: string;
}

/**
 * Real flag graphic (flag-icons, bundled — cross-platform).
 * Replaces emoji flags, which render as ISO letters ("KR", "US") on Windows.
 */
export function Flag({ cc, className = '', title }: FlagProps) {
  return (
    <span
      className={`fi fi-${cc} rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.15)] ${className}`}
      role="img"
      aria-label={cc.toUpperCase()}
      title={title}
      style={{ backgroundSize: 'cover', display: 'inline-block' }}
    />
  );
}
