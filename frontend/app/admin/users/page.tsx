"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import { UserTable } from "@/components/admin/UserTable";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { roles } from "@/lib/auth";
import type { UserRole } from "@/types/auth";
import type { AdminUser, CreateUserRequest } from "@/types/user";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateUserRequest>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Student",
  });

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get<AdminUser[]>("/Admin/users");
        setUsers(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load users."));
      }
    }
    void load();
  }, []);

  async function createUser(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post<AdminUser>("/Admin/users", form);
      setUsers((items) => [data, ...items]);
      setForm({ firstName: "", lastName: "", email: "", password: "", role: "Student" });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create user."));
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user?")) {
      return;
    }
    setError("");
    try {
      await api.delete(`/Admin/users/${id}`);
      setUsers((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete user."));
    }
  }

  return (
    <DashboardLayout roles={["Admin"]}>
      <PageHeader title="Users" description="Admins can create Student, Teacher, and Admin accounts." />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-950">Create user</h2>
          <form onSubmit={createUser} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Input label="First name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <Input label="Last name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              options={roles.map((role) => ({ label: role, value: role }))}
            />
            <Button type="submit" icon={<Plus className="h-4 w-4" />}>Create user</Button>
          </form>
        </Card>
        <UserTable
          users={users}
          onRoleChanged={(changed) =>
            setUsers((items) => items.map((item) => (item.id === changed.id ? changed : item)))
          }
          onDelete={deleteUser}
        />
      </div>
    </DashboardLayout>
  );
}
