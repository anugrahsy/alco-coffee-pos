"use client";

import type { ComponentType } from "react";
import { RiHome4Line, RiNotification3Line } from "@remixicon/react";
import { ThemeToggle } from "@/components/application/theme/theme-toggle";
import { Button } from "@/components/base/buttons/button";
import { Breadcrumb, BreadcrumbItem } from "@/components/base/breadcrumb/breadcrumb";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

/** Page header: breadcrumb on the left, notifications + dark-mode switch on the right. */
export function PageHeader({
  current = "Home",
  icon,
}: {
  current?: string;
  icon?: IconComponent;
}) {
  const CurrentIcon = icon ?? RiHome4Line;

  return (
    <div className="flex items-center justify-between gap-4">
      <Breadcrumb aria-label="Breadcrumb" className="min-w-0">
        <BreadcrumbItem href="/dashboard">
          <img src="/brand/logo-calf.jpg" alt="Alco Kopi" className="size-5 rounded-full object-cover" />
          <span>Alco Kopi</span>
        </BreadcrumbItem>
        <BreadcrumbItem href="/dashboard">
          <img src="/brand/logo-calf.jpg" alt="Owner Admin" className="size-5 rounded-full object-cover" />
          <span>Owner Admin</span>
        </BreadcrumbItem>
        <BreadcrumbItem current icon={CurrentIcon}>{current}</BreadcrumbItem>
      </Breadcrumb>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative">
          <Button
            variant="secondary"
            iconOnly
            leadingIcon={RiNotification3Line}
            aria-label="Notifications"
          />
          <span className="absolute left-[18px] top-[2px] flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e7000b] px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-white">
            5
          </span>
        </div>
        <ThemeToggle collapsed />
      </div>
    </div>
  );
}
