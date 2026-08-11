import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/utils";

interface FieldProps {
  label: string;
  error?: string;
  labelClassName?: string;
}

export function Input({
  label,
  error,
  labelClassName,
  className,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className={cx("mb-1.5 block text-sm font-medium text-slate-700", labelClassName)}>
        {label}
      </span>
      <input
        className={cx(
          "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100",
          error && "border-rose-300 focus:border-rose-400 focus:ring-rose-100",
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

export function Textarea({
  label,
  error,
  labelClassName,
  className,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className={cx("mb-1.5 block text-sm font-medium text-slate-700", labelClassName)}>
        {label}
      </span>
      <textarea
        className={cx(
          "min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100",
          error && "border-rose-300 focus:border-rose-400 focus:ring-rose-100",
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
