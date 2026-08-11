"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import { UserCard } from "@/components/admin/UserCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import type { AdminUser } from "@/types/user";

export default function AdminUserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get<AdminUser>(`/Admin/users/${id}`);
        setUser(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load user."));
      }
    }
    void load();
  }, [id]);

  return (
    <DashboardLayout roles={["Admin"]}>
      <PageHeader title="User details" />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      {user ? <UserCard user={user} /> : null}
    </DashboardLayout>
  );
}
