export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center text-sm text-slate-500">
      <span className="mr-2 h-2.5 w-2.5 animate-pulse rounded-full bg-teal-500" />
      {label}
    </div>
  );
}
