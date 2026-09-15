export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <span className="text-2xl font-bold text-primary">CG</span>
        </div>
        <p className="text-sm text-muted-foreground">Control Gym</p>
      </div>
      {children}
    </div>
  );
}
