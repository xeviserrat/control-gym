"use client";

import { useActionState, useState } from "react";
import { createInvitationAction } from "@/lib/actions/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const errors = {
  invalid_email: "Introduce un correo válido.",
  daily_limit: "Has alcanzado el límite de 10 enlaces en 24 horas.",
  recipient_limit: "Espera 15 minutos entre enlaces para el mismo correo.",
  unauthenticated: "Inicia sesión para crear una invitación.",
  failed: "No se pudo crear el enlace. Vuelve a intentarlo.",
};

export function InvitationForm() {
  const [feedback, setFeedback] = useState("");
  const [result, action, pending] = useActionState(
    async (_previous: Awaited<ReturnType<typeof createInvitationAction>> | { status: "failed" } | null, data: FormData) => {
      setFeedback("");
      try {
        return await createInvitationAction(String(data.get("email") ?? ""));
      } catch {
        return { status: "failed" } as const;
      }
    },
    null,
  );

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <h2 className="font-medium">Invitar a alguien</h2>
      <form action={action} className="space-y-3">
        <Input name="email" type="email" label="Correo del destinatario" required maxLength={254} />
        <Button type="submit" loading={pending}>Crear enlace</Button>
      </form>
      {result && result.status !== "created" && <p role="alert">{errors[result.status]}</p>}
      {result?.status === "created" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Comparte este enlace con el destinatario. Caduca a los 7 días.</p>
          <Input
            label="Enlace de invitación"
            value={result.url}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
          <Button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(result.url);
                setFeedback("Enlace copiado.");
              } catch {
                setFeedback("Selecciona el enlace y cópialo manualmente.");
              }
            }}
          >
            Copiar enlace
          </Button>
          <p role="status">{feedback}</p>
        </div>
      )}
    </section>
  );
}
