"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import { invitationDestination } from "@/lib/invitations/navigation";
import { getSiteUrl } from "@/lib/site-url";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validations/auth";

export async function loginAction(invite: string | undefined, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: error.message };

  if (data.user) {
    await ensureProfile(data.user.id, data.user.email ?? parsed.data.email);
  }

  redirect(invitationDestination(invite) ?? "/dashboard");
}

export async function registerAction(invite: string | undefined, formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const destination = invitationDestination(invite);
  const callback = destination ? new URL("/auth/callback", await getSiteUrl()) : null;
  if (callback && destination) callback.searchParams.set("next", destination);
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: callback ? { emailRedirectTo: callback.href } : undefined,
  });

  if (error) return { error: error.message };

  if (destination && !data.session) {
    return { success: true, message: "Revisa tu correo y abre la confirmación en este mismo navegador para volver a la invitación." };
  }

  if (data.user) {
    await ensureProfile(data.user.id, parsed.data.email);
  }

  redirect(destination ?? "/dashboard");
}

export async function forgotPasswordAction(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Email inválido" };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/profile`,
  });

  if (error) return { error: error.message };

  return { success: true, message: "Revisa tu email para restablecer la contraseña." };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
