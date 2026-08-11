"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema } from "@/schemas/auth.schema";

type FormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerStudent, getError } = useAuth();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(registerSchema) });
  const authInput =
    "border-white/20 bg-white/10 text-white placeholder:text-teal-50/40 focus:border-amber-300 focus:ring-amber-300/20";
  const authLabel = "text-teal-50";

  async function onSubmit(values: FormValues) {
    setError("");
    try {
      await registerStudent(values);
      router.push("/login");
    } catch (err) {
      setError(getError(err, "Could not create account."));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error ? <Alert>{error}</Alert> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="First name" error={errors.firstName?.message} labelClassName={authLabel} className={authInput} {...register("firstName")} />
        <Input label="Last name" error={errors.lastName?.message} labelClassName={authLabel} className={authInput} {...register("lastName")} />
      </div>
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} labelClassName={authLabel} className={authInput} {...register("email")} />
      <Input label="Password" type="password" autoComplete="new-password" error={errors.password?.message} labelClassName={authLabel} className={authInput} {...register("password")} />
      <Button type="submit" className="w-full bg-amber-400 text-slate-950 hover:bg-amber-300" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create student account"}
      </Button>
      <p className="text-center text-sm text-teal-50/75">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-amber-200 hover:text-amber-100">
          Sign in
        </Link>
      </p>
    </form>
  );
}
