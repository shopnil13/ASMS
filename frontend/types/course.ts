export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  teacherId: string;
  createdAt: string;
}

export interface CourseRequest {
  code: string;
  name: string;
  description: string;
  teacherId: string;
}
