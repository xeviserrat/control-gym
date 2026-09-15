"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  title: string;
  subtitle?: string;
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean; message?: string } | void>;
  submitLabel: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    autoComplete?: string;
  }>;
  footer?: React.ReactNode;
}

export function AuthForm({
  title,
  subtitle,
  action,
  submitLabel,
  fields,
  footer,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; message?: string } | null, formData: FormData) => {
      const result = await action(formData);
      if (!result) return null;
      return result;
    },
    null,
  );

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <form action={formAction} className="space-y-4">
        {fields.map((field) => (
          <Input
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            autoComplete={field.autoComplete}
            required
          />
        ))}

        {state?.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}

        {state?.message && (
          <p className="text-sm text-success" role="status">
            {state.message}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" disabled={pending}>
          {pending ? "Cargando..." : submitLabel}
        </Button>
      </form>

      {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
    </div>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-primary hover:underline">
      {children}
    </Link>
  );
}
