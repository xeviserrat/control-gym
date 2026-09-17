"use client";

import { Button } from "@/components/ui/button";
import { usePendingAction } from "@/hooks/use-pending-action";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  const { pending, run } = usePendingAction("Cerrando sesión…");

  return (
    <form
      action={() =>
        run(async () => {
          await logoutAction();
        })
      }
    >
      <Button
        type="submit"
        variant="destructive"
        fullWidth
        loading={pending}
        loadingText="Cerrando sesión…"
      >
        Cerrar sesión
      </Button>
    </form>
  );
}
