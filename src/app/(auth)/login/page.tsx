import { redirect } from "next/navigation";
import { AuthForm, AuthLink } from "@/components/auth/auth-form";
import { loginAction } from "@/lib/actions/auth";
import { invitationAuthHref, invitationDestination } from "@/lib/invitations/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ invite?: string; error?: string }> }) {
  const { invite, error } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(invitationDestination(invite) ?? "/dashboard");

  return (
    <AuthForm
      title="Iniciar sesión"
      subtitle={error === "auth" && invitationDestination(invite)
        ? "No se pudo completar la confirmación. Vuelve a abrir el correo en este navegador o inicia sesión si ya lo has verificado."
        : undefined}
      action={loginAction.bind(null, invite)}
      submitLabel="Entrar"
      fields={[
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        {
          name: "password",
          label: "Contraseña",
          type: "password",
          autoComplete: "current-password",
        },
      ]}
      footer={
        <>
          <AuthLink href="/forgot-password">¿Olvidaste tu contraseña?</AuthLink>
          <p className="mt-4 text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <AuthLink href={invitationAuthHref("/register", invite)}>Regístrate</AuthLink>
          </p>
        </>
      }
    />
  );
}
