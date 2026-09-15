import { AuthForm, AuthLink } from "@/components/auth/auth-form";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
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
