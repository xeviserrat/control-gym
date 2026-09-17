import { MUSCLE_GROUPS } from "@/lib/exercise-utils";
import { cn } from "@/lib/utils";

type MuscleGroupSelectProps = {
  readonly name?: string;
  readonly label?: string;
  readonly defaultValue?: string;
  readonly required?: boolean;
  readonly className?: string;
};

export function MuscleGroupSelect({
  name = "muscleGroup",
  label = "Grupo muscular",
  defaultValue = "",
  required,
  className,
}: MuscleGroupSelectProps) {
  const id = `${name}-select`;
  const isKnownGroup = (MUSCLE_GROUPS as readonly string[]).includes(defaultValue);
  const options =
    defaultValue && !isKnownGroup
      ? ([defaultValue, ...MUSCLE_GROUPS] as const)
      : MUSCLE_GROUPS;

  return (
    <div className={cn("w-full", className)}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-muted-foreground"
      >
        {label}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="h-11 w-full appearance-none rounded-xl border border-border bg-surface bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat px-4 pr-10 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        }}
      >
        {!required && <option value="">Seleccionar grupo…</option>}
        {options.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>
    </div>
  );
}
