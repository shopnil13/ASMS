import Link from "next/link";
import { CheckCircle2, Clock, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cx, formatDate } from "@/lib/utils";
import type { Assignment } from "@/types/assignment";

export function AssignmentCard({
  assignment,
  submitted = false,
}: {
  assignment: Assignment;
  submitted?: boolean;
}) {
  return (
    <Link href={`/assignments/${assignment.id}`}>
      <Card
        className={cx(
          "h-full transition hover:-translate-y-0.5 hover:shadow-md",
          submitted
            ? "border-emerald-200 bg-emerald-50/85 hover:border-emerald-300"
            : "hover:border-cyan-200",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-950">
            {assignment.title}
          </h2>
          {submitted ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <FileText className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
          {assignment.description || "No description provided."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-cyan-50 px-2.5 py-1 font-semibold text-cyan-700">
            {assignment.totalMarks} marks
          </span>
          {submitted ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
              Submitted
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Due {formatDate(assignment.dueDate)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
