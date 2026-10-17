"use client";

import { useEffect, useRef } from "react";

/** Keep a desktop navigation rail stationary without blocking keyboard/touch navigation or browser pinch zoom. */
export function useSidebarWheelLock(enabled: boolean) {
	const ref = useRef<HTMLElement>(null);
	useEffect(() => {
		const sidebar = ref.current;
		if (!enabled || !sidebar) return;
		const lock = (event: WheelEvent) => {
			if (!event.ctrlKey && event.cancelable) event.preventDefault();
		};
		sidebar.addEventListener("wheel", lock, { passive: false });
		return () => sidebar.removeEventListener("wheel", lock);
	}, [enabled]);
	return ref;
}
