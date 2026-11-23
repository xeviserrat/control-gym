import { redirect } from "next/navigation";
import { AuthForm, AuthLink } from "@/components/auth/auth-form";
import { registerAction } from "@/lib/actions/auth";
import { invitationAuthHref, invitationDestination } from "@/lib/invitations/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ invite?: string }> }) {
  const { invite } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(invitationDestination(invite) ?? "/dashboard");

  return (
    <AuthForm
      title="Crear cuenta"
      subtitle="Empieza a registrar tus entrenamientos"
      action={registerAction.bind(null, invite)}
      submitLabel="Registrarse"
      fields={[
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        {
          name: "password",
          label: "Contraseña",
          type: "password",
          autoComplete: "new-password",
        },
        {
          name: "confirmPassword",
          label: "Confirmar contraseña",
          type: "password",
          autoComplete: "new-password",
        },
      ]}
      footer={
        <p className="text-muted-foreground">
          ¿Ya tienes cuenta? <AuthLink href={invitationAuthHref("/login", invite)}>Inicia sesión</AuthLink>
        </p>
      }
    />
  );
}
