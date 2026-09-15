"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={() =>
        startTransition(async () => {
          await logoutAction();
        })
      }
    >
      <Button
        type="submit"
        variant="destructive"
        fullWidth
        disabled={pending}
      >
        {pending ? "Cerrando sesión..." : "Cerrar sesión"}
      </Button>
    </form>
  );
}
