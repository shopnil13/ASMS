"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cx } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/assignments", label: "Assignments", icon: FileText },
  { href: "/submissions", label: "Submissions", icon: ClipboardCheck },
  { href: "/admin", label: "Admin", icon: ShieldCheck, roles: ["Admin"] as UserRole[] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["Admin"] as UserRole[] },
] satisfies Array<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}>;

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 border-r border-white/20 bg-slate-950/90 text-white shadow-2xl shadow-slate-950/20 lg:block">
      <div className="px-5 py-6">
        <div className="text-lg font-bold text-white">ASMS</div>
        <p className="mt-1 text-xs text-teal-100/70">Assignment operations</p>
      </div>
      <nav className="space-y-1 px-3">
        {nav
          .filter((item) => !item.roles || item.roles.includes(role))
          .map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-teal-400/20 text-teal-50 ring-1 ring-teal-300/25"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
