import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  inputSize?: "md" | "lg" | "xl";
}

const sizeStyles = {
  md: "h-11 text-base rounded-xl",
  lg: "h-14 text-xl rounded-xl",
  xl: "h-16 text-3xl font-semibold text-center rounded-2xl",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, inputSize = "md", ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-muted-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full border border-border bg-surface px-4 text-foreground",
            "placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            sizeStyles[inputSize],
            error && "border-destructive focus:border-destructive focus:ring-destructive/30",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
