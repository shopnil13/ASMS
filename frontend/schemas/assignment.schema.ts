import { z } from "zod";

export const assignmentSchema = z.object({
  courseId: z.string().uuid("Choose a course."),
  title: z.string().trim().min(1, "Title is required.").max(200),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  dueDate: z.string().min(1, "Due date is required."),
  totalMarks: z.coerce
    .number()
    .positive("Marks must be greater than zero.")
    .max(1000000),
});
