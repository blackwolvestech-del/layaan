import type { SVGProps } from "react";

const paths = {
  search: <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.3-2.2L21 21" />,
  bag: (
    <>
      <path d="M5 8h14l-1 12.5a1 1 0 0 1-1 .9H7a1 1 0 0 1-1-.9L5 8Z" />
      <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
    </>
  ),
  heart: <path d="M12 20.3s-7.8-4.6-7.8-10.3A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.8 2.4c0 5.7-7.8 10.3-7.8 10.3Z" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20.5c1.1-3.6 4-5.6 7.5-5.6s6.4 2 7.5 5.6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>
  ),
  moon: <path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z" />,
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h11" />,
  close: <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />,
  arrowRight: <path d="M4 12h15.5M14 6.5l5.5 5.5-5.5 5.5" />,
  arrowLeft: <path d="M20 12H4.5M10 6.5 4.5 12l5.5 5.5" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  zoom: <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.3-2.2L21 21M10.5 7.5v6M7.5 10.5h6" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  play: <path d="M8 5.5v13l10.5-6.5L8 5.5Z" />,
  pause: <path d="M8.5 5.5v13M15.5 5.5v13" />,
  sound: <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4ZM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />,
  mute: <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4ZM16 9.5l5 5M21 9.5l-5 5" />,
  truck: <path d="M3 6.5h11v9H3zM14 10h4l3 3v2.5h-7M7 18.5a1.5 1.5 0 1 0 0-.01M17 18.5a1.5 1.5 0 1 0 0-.01" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.6v.1" />
    </>
  ),
  mail: <path d="M3.5 6.5h17v11h-17zM3.5 7l8.5 6.5L20.5 7" />,
  grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  drag: <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />,
  logout: <path d="M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5M10 16.5 14.5 12 10 7.5M14.5 12H4" />,
  ruler: <path d="M3.5 15.5 15.5 3.5l5 5-12 12-5-5ZM7 12l2 2M9.5 9.5l1.5 1.5M12 7l2 2" />,
  box: <path d="M4 7.5 12 3.5l8 4v9l-8 4-8-4v-9ZM4 7.5l8 4 8-4M12 11.5v9" />,
  returns: <path d="M9 7.5H16a4.5 4.5 0 0 1 0 9H7M9 4 5.5 7.5 9 11" />,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  starFilled: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="none" />,
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </>
  ),
  lock: (
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  ),
  edit: (
    <>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ),
  package: (
    <>
      <path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v8.42a1.78 1.78 0 0 0 .88 1.54l8.95 5.16a1.78 1.78 0 0 0 2.5-1.54V10.94a1.78 1.78 0 0 0-.88-1.54Z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </>
  ),
  cash: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="1" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9.5v5M18 9.5v5" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="1.5" />
      <path d="M2.5 10h19M6 14.5h4" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, strokeWidth = 1.4, ...rest }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
