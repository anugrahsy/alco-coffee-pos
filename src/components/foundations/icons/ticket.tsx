import type { SVGProps } from "react";

/**
 * Custom ticket glyph (Heroicons-style outline, 1.5px stroke) used as the
 * promo mark — not a Remix icon. Renders `currentColor` and sizes via
 * Tailwind `size-*` utilities, exactly like the Remix icon components.
 */

type IconProps = SVGProps<SVGSVGElement>;

/** 24×24 outline ticket. Promo table rows, header, and stat tiles. */
export function TicketIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
      />
    </svg>
  );
}
