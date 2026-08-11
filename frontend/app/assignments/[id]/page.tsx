"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipboardCheck, Edit, Trash2 } from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/api";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { AssignmentDetails } from "@/components/assignments/AssignmentDetails";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubmissionForm } from "@/components/submissions/SubmissionForm";
import { SubmissionCard } from "@/components/submissions/SubmissionCard";
import { SubmissionList } from "@/components/submissions/SubmissionList";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { useSubmissions } from "@/hooks/useSubmissions";
import type { Assignment } from "@/types/assignment";
import type { Submission } from "@/types/submission";

export default function AssignmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);
  const [error, setError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const {
    submissions,
    loading: submissionsLoading,
    createSubmission,
  } = useSubmissions(user?.role === "Teacher" ? id : undefined);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get<Assignment>(`/Assignment/${id}`);
        setAssignment(data);

        if (user?.role === "Student") {
          const submissionResponse = await api
            .get<Submission>(`/Submission/assignment/${id}/mine`)
            .then((response) => response.data)
            .catch(() => null);

          setMySubmission(submissionResponse);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load assignment."));
      }
    }
    void load();
  }, [id, user?.role]);

  async function removeAssignment() {
    if (!confirm("Delete this assignment and its submissions?")) {
      return;
    }

    try {
      await api.delete(`/Assignment/${id}`);
      router.push("/assignments");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete assignment."));
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={assignment?.title ?? "Assignment details"}
        action={
          user?.role === "Teacher" ? (
            <div className="flex gap-2">
              <Link href={`/assignments/${id}/edit`}>
                <Button variant="secondary" icon={<Edit className="h-4 w-4" />}>Edit</Button>
              </Link>
              <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={removeAssignment}>Delete</Button>
            </div>
          ) : null
        }
      />
      {error ? <div className="mb-4"><Alert>{error}</Alert></div> : null}
      {assignment ? <AssignmentDetails assignment={assignment} /> : null}

      {user?.role === "Student" && assignment ? (
        <div className="mt-8">
          {mySubmission ? (
            <>
              <PageHeader
                title="Your submission"
                description="This assignment has already been submitted. Your PDF preview is shown below."
              />
              <SubmissionCard submission={mySubmission} />
            </>
          ) : (
            <>
              <PageHeader title="Submit work" description="One submission is allowed per student for each assignment." />
              <Card>
                <SubmissionForm
                  assignmentId={assignment.id}
                  error={error}
                  success={submitSuccess}
                  onSubmit={async (values) => {
                    setError("");
                    setSubmitSuccess("");
                    try {
                      const submission = await createSubmission({
                        assignmentId: values.assignmentId,
                        content: values.content,
                        pdfFile: values.pdfFile[0],
                      });
                      setMySubmission(submission);
                      setSubmitSuccess("Submission received.");
                    } catch (err) {
                      setError(getApiErrorMessage(err, "Could not submit work."));
                    }
                  }}
                />
              </Card>
            </>
          )}
        </div>
      ) : null}

      {user?.role === "Teacher" ? (
        <div className="mt-8">
          <PageHeader title="Submissions" action={<ClipboardCheck className="h-5 w-5 text-slate-400" />} />
          <SubmissionList submissions={submissions} loading={submissionsLoading} canGrade />
        </div>
      ) : null}
    </DashboardLayout>
  );
}
