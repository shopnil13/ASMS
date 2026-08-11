"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import { GradeForm } from "@/components/submissions/GradeForm";
import { SubmissionCard } from "@/components/submissions/SubmissionCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { useSubmissions } from "@/hooks/useSubmissions";
import type { Submission } from "@/types/submission";

export default function GradeSubmissionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { gradeSubmission } = useSubmissions();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get<Submission>(`/Submission/${id}`);
        setSubmission(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load submission."));
      }
    }
    void load();
  }, [id]);

  return (
    <DashboardLayout roles={["Teacher"]}>
      <PageHeader title="Grade submission" description="Marks and feedback are sent as query parameters to match the current backend action signature." />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        {submission ? <SubmissionCard submission={submission} /> : <div />}
        <Card>
          <GradeForm
            error={error}
            onSubmit={async (values) => {
              setError("");
              try {
                const graded = await gradeSubmission(id, values);
                router.push(`/submissions/${graded.id}`);
              } catch (err) {
                setError(getApiErrorMessage(err, "Could not save grade."));
              }
            }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
