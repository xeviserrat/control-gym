"use client";

import { useEffect } from "react";

/**
 * Reduces accidental reload/navigation while a workout is in progress.
 * - beforeunload prompt when closing or refreshing the tab
 * - overscroll-behavior to limit pull-to-refresh on mobile
 */
export function useWorkoutGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const root = document.documentElement;
    const previousOverscroll = root.style.overscrollBehavior;
    root.style.overscrollBehavior = "none";
    root.dataset.workoutActive = "true";

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      root.style.overscrollBehavior = previousOverscroll;
      delete root.dataset.workoutActive;
    };
  }, [active]);
}
