"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { gradeSchema } from "@/schemas/submission.schema";

type FormInput = z.input<typeof gradeSchema>;
type FormValues = z.output<typeof gradeSchema>;

export function GradeForm({
  error,
  onSubmit,
}: {
  error?: string;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(gradeSchema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error ? <Alert>{error}</Alert> : null}
      <Input label="Marks obtained" type="number" step="0.01" error={errors.marksObtained?.message} {...register("marksObtained")} />
      <Textarea label="Feedback" error={errors.feedback?.message} {...register("feedback")} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving grade..." : "Save grade"}
      </Button>
    </form>
  );
}
