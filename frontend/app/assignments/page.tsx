"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { AssignmentList } from "@/components/assignments/AssignmentList";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import type { Assignment } from "@/types/assignment";
import type { Submission } from "@/types/submission";

export default function AssignmentsPage() {
  const { user } = useAuth();
  const { courses, loading: coursesLoading, error: courseError } = useCourses();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submittedAssignmentIds, setSubmittedAssignmentIds] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAll() {
      if (coursesLoading) {
        return;
      }

      setLoading(true);
      try {
        const results = await Promise.all(
          courses.map((course) =>
            api
              .get<Assignment[]>(`/Assignment/course/${course.id}`)
              .then((response) => response.data),
          ),
        );
        const allAssignments = results.flat();
        setAssignments(allAssignments);

        if (user?.role === "Student") {
          const submitted = await Promise.all(
            allAssignments.map((assignment) =>
              api
                .get<Submission>(`/Submission/assignment/${assignment.id}/mine`)
                .then(() => assignment.id)
                .catch(() => null),
            ),
          );

          setSubmittedAssignmentIds(
            new Set(submitted.filter((id): id is string => Boolean(id))),
          );
        } else {
          setSubmittedAssignmentIds(new Set());
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load assignments."));
      } finally {
        setLoading(false);
      }
    }

    void loadAll();
  }, [courses, coursesLoading, user?.role]);

  const canCreate = user?.role === "Teacher";

  return (
    <DashboardLayout>
      <PageHeader
        title="Assignments"
        description="Assignments are owned through their course. Teachers can only mutate assignments for courses they own."
        action={
          canCreate ? (
            <Link href="/assignments/create">
              <Button icon={<Plus className="h-4 w-4" />}>Create assignment</Button>
            </Link>
          ) : null
        }
      />
      {courseError || error ? <div className="mb-4"><Alert>{courseError || error}</Alert></div> : null}
      <AssignmentList
        assignments={assignments}
        loading={loading || coursesLoading}
        canCreate={canCreate}
        submittedAssignmentIds={submittedAssignmentIds}
      />
    </DashboardLayout>
  );
}
