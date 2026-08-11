"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { courseSchema } from "@/schemas/course.schema";
import type { Course, CourseRequest } from "@/types/course";

type FormValues = z.infer<typeof courseSchema>;

export function CourseForm({
  initial,
  teacherId,
  error,
  onSubmit,
}: {
  initial?: Course;
  teacherId: string;
  error?: string;
  onSubmit: (request: CourseRequest) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: initial,
  });

  async function submit(values: FormValues) {
    await onSubmit({
      ...values,
      description: values.description ?? "",
      teacherId,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {error ? <Alert>{error}</Alert> : null}
      <Input label="Course code" placeholder="CSE101" error={errors.code?.message} {...register("code")} />
      <Input label="Course name" placeholder="Introduction to Computer Science" error={errors.name?.message} {...register("name")} />
      <Textarea label="Description" error={errors.description?.message} {...register("description")} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : initial ? "Update course" : "Create course"}
      </Button>
    </form>
  );
}
