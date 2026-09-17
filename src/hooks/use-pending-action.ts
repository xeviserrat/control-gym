"use client";

import { useCallback, useTransition } from "react";
import { useLoading } from "@/components/providers/loading-provider";

type PendingActionOptions = {
  overlay?: boolean;
  message?: string;
};

export function usePendingAction(defaultMessage = "Cargando…") {
  const { withLoading } = useLoading();
  const [pending, startTransition] = useTransition();

  const run = useCallback(
    (action: () => Promise<void>, options?: PendingActionOptions) => {
      startTransition(async () => {
        if (options?.overlay === false) {
          await action();
          return;
        }
        await withLoading(action, options?.message ?? defaultMessage);
      });
    },
    [defaultMessage, withLoading],
  );

  return { pending, run };
}
