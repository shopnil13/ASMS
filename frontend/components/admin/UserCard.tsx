import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { AdminUser } from "@/types/user";

export function UserCard({ user }: { user: AdminUser }) {
  return (
    <Card>
      <h2 className="font-semibold text-slate-950">
        {user.firstName} {user.lastName}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{user.email}</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Role</dt>
          <dd className="font-semibold text-slate-950">{user.role}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Created</dt>
          <dd className="text-slate-950">{formatDate(user.createdAt)}</dd>
        </div>
      </dl>
    </Card>
  );
}
