import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function ensureProfile(userId: string, email: string) {
  return prisma.profile.upsert({
    where: { id: userId },
    update: { email },
    create: { id: userId, email },
  });
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export function actionError(message: string): ActionResult<never> {
  return { success: false, error: message };
}

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { success: true, data };
}
