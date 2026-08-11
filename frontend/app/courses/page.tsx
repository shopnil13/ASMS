"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { CourseList } from "@/components/courses/CourseList";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";

export default function CoursesPage() {
  const { user } = useAuth();
  const { courses, loading, error } = useCourses();
  const canCreate = user?.role === "Teacher";

  return (
    <DashboardLayout>
      <PageHeader
        title="Courses"
        description="Authenticated users can browse courses. Only teachers can create, update, or delete courses."
        action={
          canCreate ? (
            <Link href="/courses/create">
              <Button icon={<Plus className="h-4 w-4" />}>Create course</Button>
            </Link>
          ) : null
        }
      />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      <CourseList courses={courses} loading={loading} canCreate={canCreate} />
    </DashboardLayout>
  );
}
