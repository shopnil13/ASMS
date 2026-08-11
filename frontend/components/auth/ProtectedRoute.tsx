"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Loading } from "@/components/ui/Loading";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

export function ProtectedRoute({
  roles,
  children,
}: {
  roles?: UserRole[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login");
    }
  }, [ready, router, user]);

  if (!ready) {
    return <Loading label="Checking session" />;
  }

  if (!user) {
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Alert>
        This area is restricted to {roles.join(", ")} accounts. Your current
        role is {user.role}.
      </Alert>
    );
  }

  return children;
}
