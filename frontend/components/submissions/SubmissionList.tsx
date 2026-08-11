import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loading } from "@/components/ui/Loading";
import { SubmissionCard } from "@/components/submissions/SubmissionCard";
import type { Submission } from "@/types/submission";

export function SubmissionList({
  submissions,
  loading,
  canGrade,
}: {
  submissions: Submission[];
  loading: boolean;
  canGrade: boolean;
}) {
  if (loading) {
    return <Loading label="Loading submissions" />;
  }

  if (submissions.length === 0) {
    return (
      <EmptyState title="No submissions yet">
        Student work for this assignment will appear here for teachers.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <div key={submission.id} className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <SubmissionCard submission={submission} />
          {canGrade ? (
            <Link href={`/submissions/${submission.id}/grade`}>
              <Button variant="secondary" icon={<ClipboardCheck className="h-4 w-4" />}>
                Grade
              </Button>
            </Link>
          ) : null}
        </div>
      ))}
    </div>
  );
}
