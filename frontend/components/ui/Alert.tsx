import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function Alert({
  children,
  tone = "danger",
}: {
  children: React.ReactNode;
  tone?: "danger" | "success";
}) {
  const Icon = tone === "danger" ? AlertTriangle : CheckCircle2;
  const styles =
    tone === "danger"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${styles}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
