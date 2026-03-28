export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-rupe-green">RUPE</h1>
          <p className="text-sm text-foreground/50 mt-1">Tu progreso, tu identidad.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
