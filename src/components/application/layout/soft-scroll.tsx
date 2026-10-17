"use client";
import { useRef, type ReactNode } from "react";
import { cx } from "@/utils/cx";

/** Scroll-edge treatment mandated by BoardUI. CSS variables avoid rerendering the content on scroll. */
export function SoftScroll({ children, className, contentClassName, surface = "var(--color-background-primary-default)" }: {
  children: ReactNode; className?: string; contentClassName?: string; surface?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  return <div ref={root} className={cx("relative flex min-h-0 min-w-0 flex-1 flex-col", className)}>
    <div onScroll={event => root.current?.style.setProperty("--scroll-edge-opacity", String(Math.min(1, event.currentTarget.scrollTop / 24)))} className={cx("min-h-0 min-w-0 overflow-y-auto overscroll-contain", contentClassName)}>{children}</div>
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10">
      <div className="absolute inset-x-0 top-0 h-6 backdrop-blur-[1px] [mask-image:linear-gradient(black,transparent)]" style={{ opacity: "var(--scroll-edge-opacity, 0)" }} />
      <div className="absolute inset-x-0 top-0 h-4 backdrop-blur-[4px] [mask-image:linear-gradient(black,transparent)]" style={{ opacity: "var(--scroll-edge-opacity, 0)" }} />
      <div className="absolute inset-x-0 top-0 h-6" style={{ opacity: "var(--scroll-edge-opacity, 0)", background: `linear-gradient(${surface}, transparent)` }} />
    </div>
  </div>;
}
