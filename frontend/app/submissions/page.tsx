"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

export default function SubmissionsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <PageHeader
        title="Submissions"
        description="Submission permissions come from assignment context in the backend."
      />
      <Card>
        {user?.role === "Student" ? (
          <p className="text-sm leading-6 text-slate-600">
            Open an assignment to submit your work. The backend enforces one
            submission per student per assignment.
          </p>
        ) : null}
        {user?.role === "Teacher" ? (
          <p className="text-sm leading-6 text-slate-600">
            Open an assignment to review and grade submissions. Grades are sent
            using the backend&apos;s query-parameter contract.
          </p>
        ) : null}
        {user?.role === "Admin" ? (
          <p className="text-sm leading-6 text-slate-600">
            Admin accounts manage users only; they do not inherit teacher
            grading permissions.
          </p>
        ) : null}
      </Card>
    </DashboardLayout>
  );
}
