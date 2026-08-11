"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import { AssignmentForm } from "@/components/assignments/AssignmentForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { useAssignments } from "@/hooks/useAssignments";
import { useCourses } from "@/hooks/useCourses";
import type { Assignment, AssignmentRequest } from "@/types/assignment";

export default function EditAssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { courses } = useCourses();
  const { updateAssignment } = useAssignments();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get<Assignment>(`/Assignment/${id}`);
        setAssignment(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load assignment."));
      }
    }
    void load();
  }, [id]);

  async function submit(request: AssignmentRequest) {
    setError("");
    try {
      await updateAssignment(id, request);
      router.push(`/assignments/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update assignment."));
    }
  }

  return (
    <DashboardLayout roles={["Teacher"]}>
      <PageHeader title="Edit assignment" description="The backend rejects moving an assignment to another course." />
      <Card>
        {assignment ? (
          <AssignmentForm initial={assignment} courses={courses} error={error} onSubmit={submit} />
        ) : null}
      </Card>
    </DashboardLayout>
  );
}
