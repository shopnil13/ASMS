import { z } from "zod";

type FileListLike = {
  length: number;
  item?: (index: number) => File | null;
  [index: number]: File;
};

function getFirstFile(files: FileListLike) {
  return files.item?.(0) ?? files[0];
}

const pdfFileSchema = z
  .custom<FileListLike>(
    (files) => Boolean(files && typeof files === "object" && "length" in files),
    "Choose a PDF file.",
  )
  .refine((files) => files.length === 1, "Choose a PDF file.")
  .refine(
    (files) => getFirstFile(files)?.type === "application/pdf",
    "Only PDF files are allowed.",
  )
  .refine(
    (files) => !getFirstFile(files) || getFirstFile(files).size <= 25 * 1024 * 1024,
    "PDF file must be 25 MB or smaller.",
  );

export const submissionSchema = z.object({
  assignmentId: z.string().uuid(),
  content: z.string().trim().max(10000).optional().or(z.literal("")),
  pdfFile: pdfFileSchema,
});

export const gradeSchema = z.object({
  marksObtained: z.coerce.number().min(0, "Marks cannot be negative."),
  feedback: z.string().trim().max(5000).optional().or(z.literal("")),
});
