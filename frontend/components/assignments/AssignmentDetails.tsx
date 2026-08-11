import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { Assignment } from "@/types/assignment";

export function AssignmentDetails({ assignment }: { assignment: Assignment }) {
  return (
    <Card>
      <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-slate-500">Due date</dt>
          <dd className="mt-1 font-semibold text-slate-950">
            {formatDate(assignment.dueDate)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Total marks</dt>
          <dd className="mt-1 text-slate-950">{assignment.totalMarks}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Course ID</dt>
          <dd className="mt-1 truncate font-mono text-xs text-slate-700">{assignment.courseId}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Created</dt>
          <dd className="mt-1 text-slate-950">{formatDate(assignment.createdAt)}</dd>
        </div>
      </dl>
      <p className="mt-5 text-sm leading-6 text-slate-600">
        {assignment.description || "No description provided."}
      </p>
    </Card>
  );
}
