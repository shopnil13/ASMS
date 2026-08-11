import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { Course } from "@/types/course";

export function CourseDetails({ course }: { course: Course }) {
  return (
    <Card>
      <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-slate-500">Code</dt>
          <dd className="mt-1 font-semibold text-slate-950">{course.code}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Teacher ID</dt>
          <dd className="mt-1 truncate font-mono text-xs text-slate-700">{course.teacherId}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Created</dt>
          <dd className="mt-1 text-slate-950">{formatDate(course.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Description</dt>
          <dd className="mt-1 text-slate-950">{course.description || "None"}</dd>
        </div>
      </dl>
    </Card>
  );
}
