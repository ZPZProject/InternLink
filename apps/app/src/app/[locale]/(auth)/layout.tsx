export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/30 flex min-h-screen flex-col items-center justify-center p-6">
      <div className="bg-card w-full max-w-md rounded-xl border p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
