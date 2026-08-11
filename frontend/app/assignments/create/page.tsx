"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useState } from "react";
import { AssignmentForm } from "@/components/assignments/AssignmentForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { getApiErrorMessage } from "@/lib/api";
import { useAssignments } from "@/hooks/useAssignments";
import { useCourses } from "@/hooks/useCourses";
import type { AssignmentRequest } from "@/types/assignment";

function CreateAssignmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { courses } = useCourses();
  const { createAssignment } = useAssignments();
  const [error, setError] = useState("");

  const selectedCourseId = searchParams.get("courseId");
  const orderedCourses = selectedCourseId
    ? [...courses].sort((a) => (a.id === selectedCourseId ? -1 : 1))
    : courses;

  async function submit(request: AssignmentRequest) {
    setError("");
    try {
      const assignment = await createAssignment(request);
      router.push(`/assignments/${assignment.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create assignment."));
    }
  }

  return (
    <DashboardLayout roles={["Teacher"]}>
      <PageHeader title="Create assignment" description="Assignments must stay attached to the selected course." />
      <Card>
        <AssignmentForm courses={orderedCourses} error={error} onSubmit={submit} />
      </Card>
    </DashboardLayout>
  );
}

export default function CreateAssignmentPage() {
  return (
    <Suspense fallback={null}>
      <CreateAssignmentContent />
    </Suspense>
  );
}
