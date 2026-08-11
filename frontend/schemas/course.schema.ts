import { z } from "zod";

export const courseSchema = z.object({
  code: z.string().trim().min(1, "Course code is required.").max(50),
  name: z.string().trim().min(1, "Course name is required.").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});
