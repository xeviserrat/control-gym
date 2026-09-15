export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="text-lg font-semibold">Sin conexión</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Control Gym necesita internet para sincronizar tu entrenamiento. Vuelve
        a abrir la app cuando tengas conexión.
      </p>
    </div>
  );
}
