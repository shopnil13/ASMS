import Link from "next/link";
import { Calendar, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { Course } from "@/types/course";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-teal-700">
              {course.code}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              {course.name}
            </h2>
          </div>
          <GraduationCap className="h-5 w-5 text-slate-400" />
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
          {course.description || "No description provided."}
        </p>
        <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          Created {formatDate(course.createdAt)}
        </p>
      </Card>
    </Link>
  );
}
