"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RoleSelector } from "@/components/admin/RoleSelector";
import { Table } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";
import type { AdminUser } from "@/types/user";

export function UserTable({
  users,
  onRoleChanged,
  onDelete,
}: {
  users: AdminUser[];
  onRoleChanged: (user: AdminUser) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
        <tr>
          <th className="px-4 py-3">User</th>
          <th className="px-4 py-3">Role</th>
          <th className="px-4 py-3">Created</th>
          <th className="px-4 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {users.map((user) => (
          <tr key={user.id}>
            <td className="px-4 py-3">
              <div className="font-medium text-slate-950">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-slate-500">{user.email}</div>
            </td>
            <td className="px-4 py-3">
              <RoleSelector user={user} onChanged={onRoleChanged} />
            </td>
            <td className="px-4 py-3 text-slate-500">
              {formatDate(user.createdAt)}
            </td>
            <td className="px-4 py-3 text-right">
              <Button
                type="button"
                variant="ghost"
                aria-label={`Delete ${user.email}`}
                className="h-9 w-9 p-0 text-rose-600 hover:text-rose-700"
                onClick={() => onDelete(user.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
