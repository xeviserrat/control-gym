import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { acceptInvitationAction, changeInvitationAccountAction } from "@/lib/actions/invitations";
import { getInvitationStatus } from "@/lib/invitations/invitations";
import { invitationAuthHref, invitationCookieName, invitationDestination } from "@/lib/invitations/navigation";

const messages = {
  invalid_token: "Este enlace de invitación no es válido. Vuelve a abrir el enlace que te compartieron.",
  expired: "El enlace ha caducado. Pide a quien te invitó que cree uno nuevo.",
  wrong_account: "Has abierto la invitación con otra cuenta. Inicia sesión con el correo al que va dirigida.",
  unverified_email: "Verifica el correo de tu cuenta para poder aceptar la invitación.",
  accepted: "Invitación aceptada.",
  unauthenticated: "Inicia sesión o regístrate con el correo al que va dirigida la invitación.",
  pending: "Ya puedes aceptar la invitación a Control Gym.",
};

export default async function InvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref = "" } = await searchParams;
  const token = invitationDestination(ref)
    ? (await cookies()).get(invitationCookieName(ref))?.value
    : undefined;
  const status = token ? await getInvitationStatus(token) : "invalid_token";

  return (
    <main className="mx-auto max-w-sm space-y-5 px-6 py-16">
      <h1 className="text-2xl font-semibold">Invitación a Control Gym</h1>
      <p role="status">{messages[status]}</p>
      {status === "pending" && (
        <form action={acceptInvitationAction.bind(null, ref)}>
          <Button type="submit">Aceptar invitación</Button>
        </form>
      )}
      {(status === "wrong_account" || status === "unverified_email") && (
        <form action={changeInvitationAccountAction.bind(null, ref)}>
          <Button type="submit" variant="secondary">Cambiar de cuenta</Button>
        </form>
      )}
      {status === "unauthenticated" && (
        <div className="flex flex-wrap gap-4">
          <Link className="text-primary underline" href={invitationAuthHref("/login", ref)}>Iniciar sesión</Link>
          <Link className="text-primary underline" href={invitationAuthHref("/register", ref)}>Crear cuenta</Link>
        </div>
      )}
      {status === "accepted" && <Link className="text-primary underline" href="/dashboard">Ir al inicio</Link>}
    </main>
  );
}
