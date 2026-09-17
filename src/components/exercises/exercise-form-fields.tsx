import { Input } from "@/components/ui/input";
import { MuscleGroupSelect } from "@/components/exercises/muscle-group-select";

export type ExerciseFormDefaults = {
  readonly name?: string;
  readonly description?: string;
  readonly muscleGroup?: string;
  readonly repsMin?: number;
  readonly repsMax?: number;
};

type ExerciseFormFieldsProps = {
  readonly defaults?: ExerciseFormDefaults;
};

export function ExerciseFormFields({ defaults }: ExerciseFormFieldsProps) {
  return (
    <>
      <Input
        name="name"
        label="Nombre"
        required
        defaultValue={defaults?.name}
        autoFocus={!defaults}
      />
      <MuscleGroupSelect defaultValue={defaults?.muscleGroup ?? ""} />
      <div className="grid grid-cols-2 gap-3">
        <Input
          name="repsMin"
          label="Reps mín"
          type="number"
          min={1}
          max={100}
          placeholder="8"
          defaultValue={defaults?.repsMin ?? ""}
        />
        <Input
          name="repsMax"
          label="Reps máx"
          type="number"
          min={1}
          max={100}
          placeholder="12"
          defaultValue={defaults?.repsMax ?? ""}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Opcional. Si lo indicas, se usará al añadir el ejercicio a una rutina.
      </p>
      <div className="w-full">
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-medium text-muted-foreground"
        >
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Notas sobre técnica, variante, etc."
          defaultValue={defaults?.description ?? ""}
          className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>
    </>
  );
}
