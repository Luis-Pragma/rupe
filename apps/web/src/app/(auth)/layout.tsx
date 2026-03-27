export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Logo RUPE */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-rupe-green">
            RUPE
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            Tu progreso, tu identidad.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
