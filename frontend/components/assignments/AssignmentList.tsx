import Link from "next/link";
import { Plus } from "lucide-react";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loading } from "@/components/ui/Loading";
import type { Assignment } from "@/types/assignment";

export function AssignmentList({
  assignments,
  loading,
  canCreate,
  submittedAssignmentIds = new Set<string>(),
}: {
  assignments: Assignment[];
  loading: boolean;
  canCreate: boolean;
  submittedAssignmentIds?: Set<string>;
}) {
  if (loading) {
    return <Loading label="Loading assignments" />;
  }

  if (assignments.length === 0) {
    return (
      <EmptyState
        title="No assignments available"
        action={
          canCreate ? (
            <Link href="/assignments/create">
              <Button icon={<Plus className="h-4 w-4" />}>Create assignment</Button>
            </Link>
          ) : null
        }
      >
        Assignments are grouped under courses and inherit course ownership rules.
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {assignments.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          submitted={submittedAssignmentIds.has(assignment.id)}
        />
      ))}
    </div>
  );
}
