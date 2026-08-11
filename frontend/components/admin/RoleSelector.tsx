"use client";

import { useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import { roles } from "@/lib/auth";
import type { UserRole } from "@/types/auth";
import type { AdminUser } from "@/types/user";

export function RoleSelector({
  user,
  onChanged,
}: {
  user: AdminUser;
  onChanged: (user: AdminUser) => void;
}) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [saving, setSaving] = useState(false);

  async function changeRole(nextRole: UserRole) {
    setRole(nextRole);
    setSaving(true);
    try {
      const { data } = await api.put<AdminUser>(`/Admin/users/${user.id}/role`, {
        role: nextRole,
      });
      onChanged(data);
    } catch (err) {
      setRole(user.role);
      alert(getApiErrorMessage(err, "Could not update role."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      aria-label={`Role for ${user.email}`}
      disabled={saving}
      value={role}
      onChange={(event) => changeRole(event.target.value as UserRole)}
      className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
    >
      {roles.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}
