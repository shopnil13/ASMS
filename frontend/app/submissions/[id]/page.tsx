"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import { Alert } from "@/components/ui/Alert";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubmissionCard } from "@/components/submissions/SubmissionCard";
import type { Submission } from "@/types/submission";

export default function SubmissionDetailsPage() {
  const { id } = useParams<{ id: string }>();
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
    <DashboardLayout>
      <PageHeader title="Submission details" />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      {submission ? <SubmissionCard submission={submission} /> : null}
    </DashboardLayout>
  );
}
