import { AuthForm, AuthLink } from "@/components/auth/auth-form";
import { forgotPasswordAction } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthForm
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace por email"
      action={forgotPasswordAction}
      submitLabel="Enviar enlace"
      fields={[
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
      ]}
      footer={
        <AuthLink href="/login">Volver al login</AuthLink>
      }
    />
  );
}
