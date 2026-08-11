import type { HTMLAttributes } from "react";
import { cx } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "rounded-lg border border-white/60 bg-white/75 p-5 shadow-sm shadow-slate-200/60 backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
