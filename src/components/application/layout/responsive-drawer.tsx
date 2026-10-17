"use client";
import type { ReactNode } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useDirection } from "@/components/foundations/direction/direction";
import { cx } from "@/utils/cx";

/** The installed sidebar/cart, presented as a focus-managed drawer on narrow screens. */
export function ResponsiveDrawer({ isOpen, onOpenChange, label, children, side = "start" }: {
  isOpen: boolean; onOpenChange: (open: boolean) => void; label: string; children: ReactNode; side?: "start" | "end";
}) {
  const direction = useDirection();
  return <ModalOverlay dir={direction} isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className={cx("fixed inset-0 z-50 flex bg-background-secondary-default/80 backdrop-blur-sm", side === "start" ? "justify-start" : "justify-end")}>
    <Modal className={cx("flex h-dvh max-w-full flex-col bg-background-primary-default shadow-dropdown", side === "start" ? "w-72 p-3" : "w-[420px]")}>
      <Dialog aria-label={label} dir={direction} className="flex min-h-0 flex-1 flex-col outline-none">{children}</Dialog>
    </Modal>
  </ModalOverlay>;
}
