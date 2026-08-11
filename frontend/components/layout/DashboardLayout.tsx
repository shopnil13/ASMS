"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

export function DashboardLayout({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) {
  const { user } = useAuth();

  return (
    <ProtectedRoute roles={roles}>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.22),transparent_30%),linear-gradient(135deg,#f8fafc_0%,#ecfeff_46%,#fff7ed_100%)]">
        <div className="flex">
          {user ? <Sidebar role={user.role} /> : null}
          <div className="min-w-0 flex-1">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
