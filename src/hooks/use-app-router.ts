"use client";

import { useRouter } from "next/navigation";
import { useLoading } from "@/components/providers/loading-provider";

export function useAppRouter() {
  const router = useRouter();
  const { startNavigation } = useLoading();

  return {
    push: (href: string) => {
      startNavigation();
      router.push(href);
    },
    replace: (href: string) => {
      startNavigation();
      router.replace(href);
    },
    back: () => {
      startNavigation();
      router.back();
    },
    refresh: router.refresh,
    prefetch: router.prefetch,
  };
}
