export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  createdAt: string;
}

export interface AssignmentRequest {
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
}
