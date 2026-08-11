"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Send, UploadCloud, X } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { submissionSchema } from "@/schemas/submission.schema";

type FormValues = z.infer<typeof submissionSchema>;

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SubmissionForm({
  assignmentId,
  error,
  success,
  onSubmit,
}: {
  assignmentId: string;
  error?: string;
  success?: string;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const fileInputId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    resetField,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { assignmentId },
  });
  const { onChange: onPdfChange, ...pdfInputProps } = register("pdfFile");
  const pdfError =
    typeof errors.pdfFile?.message === "string"
      ? errors.pdfFile.message
      : undefined;

  async function submit(values: FormValues) {
    await onSubmit(values);
    reset({ assignmentId, content: "", pdfFile: undefined });
    setSelectedFile(null);
    setFileInputKey((key) => key + 1);
  }

  function handleFiles(files: FileList | null) {
    setSelectedFile(files?.[0] ?? null);
  }

  function clearFile() {
    resetField("pdfFile");
    setSelectedFile(null);
    setFileInputKey((key) => key + 1);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {error ? <Alert>{error}</Alert> : null}
      {success ? <Alert tone="success">{success}</Alert> : null}
      <input type="hidden" {...register("assignmentId")} />
      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          PDF file
        </span>
        <label
          htmlFor={fileInputId}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const files = event.dataTransfer.files;
            setValue("pdfFile", files, { shouldValidate: true });
            handleFiles(files);
          }}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-5 py-8 text-center shadow-sm transition ${
            pdfError
              ? "border-rose-300 bg-rose-50/70 hover:bg-rose-50"
              : selectedFile
                ? "border-teal-300 bg-teal-50/80 hover:bg-teal-50"
                : "border-teal-200 bg-gradient-to-br from-white/80 to-cyan-50/80 hover:border-teal-300 hover:from-teal-50 hover:to-amber-50"
          }`}
        >
          <input
            key={fileInputKey}
            id={fileInputId}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            {...pdfInputProps}
            onChange={(event) => {
              void onPdfChange(event);
              handleFiles(event.target.files);
            }}
          />
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-900/20 transition group-hover:-translate-y-0.5 group-hover:bg-teal-700">
            {selectedFile ? (
              <FileText className="h-5 w-5" />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
          </span>
          <span className="mt-4 text-sm font-semibold text-slate-950">
            {selectedFile ? selectedFile.name : "Choose or drop a PDF"}
          </span>
          <span className="mt-1 text-xs text-slate-500">
            {selectedFile
              ? `${formatFileSize(selectedFile.size)} selected`
              : "PDF only, up to 25 MB"}
          </span>
        </label>
        {selectedFile ? (
          <button
            type="button"
            onClick={clearFile}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-rose-600"
          >
            <X className="h-3.5 w-3.5" />
            Remove file
          </button>
        ) : null}
        {pdfError ? (
          <span className="mt-1 block text-xs text-rose-600">{pdfError}</span>
        ) : null}
      </div>
      <Textarea
        label="Notes"
        placeholder="Optional message for your teacher"
        error={errors.content?.message}
        {...register("content")}
      />
      <Button type="submit" disabled={isSubmitting} icon={<Send className="h-4 w-4" />}>
        {isSubmitting ? "Uploading..." : "Submit PDF"}
      </Button>
    </form>
  );
}
