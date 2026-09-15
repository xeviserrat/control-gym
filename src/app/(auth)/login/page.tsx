import { redirect } from "next/navigation";
import { AuthForm, AuthLink } from "@/components/auth/auth-form";
import { loginAction } from "@/lib/actions/auth";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <AuthForm
      title="Iniciar sesión"
      action={loginAction}
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
            <AuthLink href="/register">Regístrate</AuthLink>
          </p>
        </>
      }
    />
  );
}
