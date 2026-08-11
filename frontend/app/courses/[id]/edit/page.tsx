"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CourseForm } from "@/components/courses/CourseForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import api, { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import type { Course, CourseRequest } from "@/types/course";

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { updateCourse } = useCourses(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get<Course>(`/Course/${id}`);
        setCourse(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load course."));
      }
    }
    void load();
  }, [id]);

  async function submit(request: CourseRequest) {
    setError("");
    try {
      await updateCourse(id, request);
      router.push(`/courses/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update course."));
    }
  }

  return (
    <DashboardLayout roles={["Teacher"]}>
      <PageHeader title="Edit course" />
      <Card>
        {user && course ? (
          <CourseForm initial={course} teacherId={user.userId} error={error} onSubmit={submit} />
        ) : null}
      </Card>
    </DashboardLayout>
  );
}
