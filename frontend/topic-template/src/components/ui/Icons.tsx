import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = (props: IconProps) => (
  <Svg {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const ArrowUpRight = (props: IconProps) => (
  <Svg {...props}>
    <path d="M7 17 17 7M9 7h8v8" />
  </Svg>
);

export const ChevronDown = (props: IconProps) => (
  <Svg {...props}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const MenuIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </Svg>
);

export const CloseIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const GlobeIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.4 2.7 3.6 5.7 3.6 9s-1.2 6.3-3.6 9c-2.4-2.7-3.6-5.7-3.6-9s1.2-6.3 3.6-9Z" />
  </Svg>
);

export const CheckIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const PlusIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const AlertIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5h.01" />
  </Svg>
);

export const SpinnerIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" opacity="0.3" />
    <path d="M21 12a9 9 0 0 0-9-9" />
  </Svg>
);

export const RouteChangeIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="5" cy="18" r="2" />
    <circle cx="19" cy="6" r="2" />
    <path d="M7 18h5a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3" />
  </Svg>
);

export const MailIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Svg>
);

export const PhoneIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </Svg>
);

export const PinIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
);

export const DocumentIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14 3H5v18h14V8Zm0 0v5h5M8 12h8M8 15h8M8 18h4" />
  </Svg>
);

export const ConversationIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M15 14a6 6 0 0 0 2-4c0-4-3-7-7-7s-7 3-7 7c0 2 1 4 3 5l-1 4 5-2h1M16 10c3 0 5 2 5 5 0 2-1 3-2 4l1 3-4-2c-3 0-5-2-6-4" />
    <path d="M7 10h.01M10 10h.01M13 10h.01" />
  </Svg>
);

export const ApprovalIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="9" cy="6" r="4" />
    <path d="M2 20v-2c0-4 3-6 7-6h2m7-1 5 2v4c0 3-3 5-5 6-2-1-5-3-5-6v-4Zm-2 6 1.5 1.5L20 15" />
  </Svg>
);

export const PalletIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M8 2h8v8H8Zm3 0v3h2V2M3 10h9v9H3Zm9 0h9v9h-9M6 10v3h3v-3m6 0v3h3v-3M2 19h20v3h-4v-1h-4v1h-4v-1H6v1H2Z" />
  </Svg>
);

export const ReleaseIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M10 21H4V3h10l4 4v3m-4-7v5h4M7 12h5m-5 4h3m4-3 4-1 4 4-6 6-4-4Z" />
    <circle cx="18" cy="16" r=".6" />
  </Svg>
);

export const DeliveryIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 7V4h12v14H8m8-10h4l3 5v5h-2M2 9h6m-7 4h6m-3 4v1m12-5h7" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="19" cy="18" r="2" />
  </Svg>
);

export const PackageIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m12 2 10 5v10l-10 5-10-5V7Zm0 10L2 7m10 5L22 7M12 12v10M7 4.5l10 5V14" />
  </Svg>
);
