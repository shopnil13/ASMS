"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/api";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { CourseDetails } from "@/components/courses/CourseDetails";
import { AssignmentList } from "@/components/assignments/AssignmentList";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAssignments } from "@/hooks/useAssignments";
import { useAuth } from "@/hooks/useAuth";
import type { Course } from "@/types/course";

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");
  const { assignments, loading } = useAssignments(id);

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

  async function removeCourse() {
    if (!confirm("Delete this course and its assignments?")) {
      return;
    }

    try {
      await api.delete(`/Course/${id}`);
      router.push("/courses");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete course."));
    }
  }

  const canManage = user?.role === "Teacher" && course?.teacherId === user.userId;

  return (
    <DashboardLayout>
      <PageHeader
        title={course?.name ?? "Course details"}
        description={course?.description}
        action={
          canManage ? (
            <div className="flex gap-2">
              <Link href={`/assignments/create?courseId=${id}`}>
                <Button variant="secondary" icon={<Plus className="h-4 w-4" />}>Assignment</Button>
              </Link>
              <Link href={`/courses/${id}/edit`}>
                <Button variant="secondary" icon={<Edit className="h-4 w-4" />}>Edit</Button>
              </Link>
              <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={removeCourse}>Delete</Button>
            </div>
          ) : null
        }
      />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      {course ? <CourseDetails course={course} /> : null}
      <div className="mt-8">
        <PageHeader title="Assignments" />
        <AssignmentList assignments={assignments} loading={loading} canCreate={Boolean(canManage)} />
      </div>
    </DashboardLayout>
  );
}
