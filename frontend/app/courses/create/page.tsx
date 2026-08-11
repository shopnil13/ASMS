"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CourseForm } from "@/components/courses/CourseForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import type { CourseRequest } from "@/types/course";

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createCourse } = useCourses(false);
  const [error, setError] = useState("");

  async function submit(request: CourseRequest) {
    setError("");
    try {
      const course = await createCourse(request);
      router.push(`/courses/${course.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create course."));
    }
  }

  return (
    <DashboardLayout roles={["Teacher"]}>
      <PageHeader title="Create course" description="The backend uses the teacher id from the JWT; the required DTO field is still sent for compatibility." />
      <Card>
        {user ? <CourseForm teacherId={user.userId} error={error} onSubmit={submit} /> : null}
      </Card>
    </DashboardLayout>
  );
}
