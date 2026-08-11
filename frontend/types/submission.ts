export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  fileName: string | null;
  fileStorageName: string | null;
  fileContentType: string | null;
  fileSize: number | null;
  fileUrl: string | null;
  submittedAt: string;
  marksObtained: number | null;
  feedback: string | null;
  createdAt: string;
}
