import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Email no válido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email no válido"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
