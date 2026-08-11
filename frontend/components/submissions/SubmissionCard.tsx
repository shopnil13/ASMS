"use client";

import { Download, Eye, FileText, X } from "lucide-react";
import { useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { PdfPreview } from "@/components/submissions/PdfPreview";
import { formatDate } from "@/lib/utils";
import type { Submission } from "@/types/submission";

export function SubmissionCard({ submission }: { submission: Submission }) {
  const [showPreview, setShowPreview] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  async function downloadFile() {
    if (!submission.fileUrl) {
      return;
    }

    setDownloadError("");

    try {
      const { data } = await api.get<Blob>(
        `${submission.fileUrl}?download=true`,
        {
          responseType: "blob",
        },
      );
      const blobUrl = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = submission.fileName ?? "submission.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setDownloadError(getApiErrorMessage(err, "Could not download PDF."));
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {submission.studentName || "Unknown Student"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Submitted {formatDate(submission.submittedAt)}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {submission.marksObtained === null ? "Ungraded" : `${submission.marksObtained} marks`}
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
        {submission.content || "No notes provided."}
      </p>

      {submission.fileName ? (
        <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50/70 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-600 text-white">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {submission.fileName}
                </p>
                <p className="text-xs text-slate-500">
                  PDF submission
                </p>
              </div>
            </div>
            {submission.fileUrl ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  icon={showPreview ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  onClick={() => setShowPreview((value) => !value)}
                >
                  {showPreview ? "Hide" : "Preview"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  icon={<Download className="h-4 w-4" />}
                  onClick={downloadFile}
                >
                  Download
                </Button>
              </div>
            ) : null}
          </div>
          {downloadError ? (
            <div className="mt-3">
              <Alert>{downloadError}</Alert>
            </div>
          ) : null}
        </div>
      ) : null}

      {showPreview && submission.fileUrl ? (
        <div className="mt-4">
          <PdfPreview
            fileUrl={submission.fileUrl}
            title={submission.fileName ?? "Submission PDF"}
          />
        </div>
      ) : null}

      {submission.feedback ? (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {submission.feedback}
        </p>
      ) : null}
    </Card>
  );
}
