import { AuthGradientPanel } from "@/components/auth/AuthGradientPanel";

import "./auth.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left: animated gradient brand panel (hidden on mobile) */}
      <div className="hidden lg:block">
        <AuthGradientPanel />
      </div>

      {/* Right: form */}
      <div className="flex flex-col items-center justify-center overflow-y-auto bg-background p-8">
        {children}
      </div>
    </div>
  );
}
