import { AuthForm, AuthLink } from "@/components/auth/auth-form";
import { registerAction } from "@/lib/actions/auth";

export default function RegisterPage() {
  return (
    <AuthForm
      title="Crear cuenta"
      subtitle="Empieza a registrar tus entrenamientos"
      action={registerAction}
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
          ¿Ya tienes cuenta? <AuthLink href="/login">Inicia sesión</AuthLink>
        </p>
      }
    />
  );
}
