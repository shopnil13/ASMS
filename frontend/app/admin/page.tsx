import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";

export default function AdminPage() {
  return (
    <DashboardLayout roles={["Admin"]}>
      <PageHeader
        title="Admin"
        description="Admin authority is intentionally scoped to user management in the backend."
      />
      <Card>
        <p className="text-sm leading-6 text-slate-600">
          Create users, assign roles, and remove accounts that are not blocked
          by course or submission dependencies.
        </p>
      </Card>
    </DashboardLayout>
  );
}
