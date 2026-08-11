import type { ReactNode } from "react";

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      {children ? <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{children}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
