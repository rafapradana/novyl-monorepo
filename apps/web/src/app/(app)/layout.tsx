"use client";

import { AuthGuard } from "@/components/auth/auth-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
