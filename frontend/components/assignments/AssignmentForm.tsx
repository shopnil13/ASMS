"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { assignmentSchema } from "@/schemas/assignment.schema";
import type { Assignment, AssignmentRequest } from "@/types/assignment";
import type { Course } from "@/types/course";

type FormInput = z.input<typeof assignmentSchema>;
type FormValues = z.output<typeof assignmentSchema>;

function toDatetimeLocal(value?: string) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 16);
}

export function AssignmentForm({
  initial,
  courses,
  error,
  onSubmit,
}: {
  initial?: Assignment;
  courses: Course[];
  error?: string;
  onSubmit: (request: AssignmentRequest) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: initial
      ? { ...initial, dueDate: toDatetimeLocal(initial.dueDate) }
      : { courseId: courses[0]?.id ?? "" },
  });

  async function submit(values: FormValues) {
    await onSubmit({
      ...values,
      description: values.description ?? "",
      dueDate: new Date(values.dueDate).toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {error ? <Alert>{error}</Alert> : null}
      <Select
        label="Course"
        disabled={Boolean(initial)}
        error={errors.courseId?.message}
        options={[
          { label: "Choose course", value: "" },
          ...courses.map((course) => ({
            label: `${course.code} - ${course.name}`,
            value: course.id,
          })),
        ]}
        {...register("courseId")}
      />
      <Input label="Title" error={errors.title?.message} {...register("title")} />
      <Textarea label="Description" error={errors.description?.message} {...register("description")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Due date" type="datetime-local" error={errors.dueDate?.message} {...register("dueDate")} />
        <Input label="Total marks" type="number" step="0.01" error={errors.totalMarks?.message} {...register("totalMarks")} />
      </div>
      <Button type="submit" disabled={isSubmitting || courses.length === 0}>
        {isSubmitting ? "Saving..." : initial ? "Update assignment" : "Create assignment"}
      </Button>
    </form>
  );
}
