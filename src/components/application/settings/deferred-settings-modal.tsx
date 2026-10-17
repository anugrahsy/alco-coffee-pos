"use client";
import { lazy, Suspense, useState } from "react";
import type { SettingsModalProps } from "./settings-modal";

let settingsModule: ReturnType<typeof importSettings> | undefined;
function importSettings() { return import("./settings-modal"); }
export function preloadSettingsModal() { return settingsModule ??= importSettings(); }
const LazySettingsModal = lazy(() => preloadSettingsModal().then(module => ({ default: module.SettingsModal })));

/** Keeps the existing modal and its exit animation; fetches its heavier pages only when needed. */
export function DeferredSettingsModal(props: SettingsModalProps) {
  const [opened, setOpened] = useState(false);
  if (props.isOpen && !opened) setOpened(true);
  if (!opened && !props.isOpen) return null;
  return <Suspense fallback={null}><LazySettingsModal {...props} /></Suspense>;
}
