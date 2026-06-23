export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">HIVE Showcase</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          EMERIS student portfolio platform
        </p>
      </div>
      {children}
    </div>
  );
}
