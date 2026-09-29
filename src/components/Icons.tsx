import type { ReactNode, SVGProps } from 'react';

export type IconName = 'home' | 'book' | 'practice' | 'volume' | 'print' | 'arrow' | 'check' | 'sparkle' | 'trash' | 'chevron' | 'bookmark' | 'clock' | 'back' | 'mic' | 'music' | 'shield';

const shapes: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/><path d="M2 10h20"/></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5V22M8 7h8M8 11h8"/></>,
  practice: <><path d="m4 16.5 10.8-10.8a2.1 2.1 0 0 1 3 3L7 19.5 3 21z"/><path d="m13.5 7.2 3.3 3.3"/><path d="M4 4h5M4 8h3M15 19h5"/></>,
  mic: <><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8"/></>,
  music: <><path d="M9 18V5l12-2v13"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="18" cy="16" rx="3" ry="2"/></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/></>,
  volume: <><path d="M4 10v4h4l5 4V6l-5 4z"/><path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a9 9 0 0 1 0 11"/></>,
  print: <><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7zM17 11h.01"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  check: <><path d="m5 12 4 4L19 6"/></>,
  sparkle: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  bookmark: <path d="M6 4h12v17l-6-4-6 4z"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  back: <><path d="M19 12H5M11 18l-6-6 6-6"/></>,
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 18, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {shapes[name]}
    </svg>
  );
}
