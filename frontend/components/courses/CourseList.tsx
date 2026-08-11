import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loading } from "@/components/ui/Loading";
import { CourseCard } from "@/components/courses/CourseCard";
import type { Course } from "@/types/course";

export function CourseList({
  courses,
  loading,
  canCreate,
}: {
  courses: Course[];
  loading: boolean;
  canCreate: boolean;
}) {
  if (loading) {
    return <Loading label="Loading courses" />;
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        title="No courses yet"
        action={
          canCreate ? (
            <Link href="/courses/create">
              <Button icon={<Plus className="h-4 w-4" />}>Create course</Button>
            </Link>
          ) : null
        }
      >
        Courses created by teachers will appear here for authenticated users.
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
