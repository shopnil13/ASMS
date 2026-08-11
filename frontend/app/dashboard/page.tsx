"use client";

import Link from "next/link";
import { BookOpen, ClipboardCheck, FileText, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { roleDescription } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={user?.role}
        title={`Welcome${user ? `, ${user.firstName}` : ""}`}
        description={user ? roleDescription(user.role) : undefined}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-teal-100/80 bg-teal-50/75">
          <BookOpen className="h-6 w-6 text-teal-700" />
          <h2 className="mt-4 font-semibold text-slate-950">Courses</h2>
          <p className="mt-2 text-sm text-slate-500">Browse all API courses.</p>
          <Link href="/courses">
            <Button className="mt-4" variant="secondary">Open</Button>
          </Link>
        </Card>
        <Card className="border-cyan-100/80 bg-cyan-50/75">
          <FileText className="h-6 w-6 text-cyan-700" />
          <h2 className="mt-4 font-semibold text-slate-950">Assignments</h2>
          <p className="mt-2 text-sm text-slate-500">View work by course.</p>
          <Link href="/assignments">
            <Button className="mt-4" variant="secondary">Open</Button>
          </Link>
        </Card>
        <Card className="border-amber-100/80 bg-amber-50/75">
          <ClipboardCheck className="h-6 w-6 text-amber-600" />
          <h2 className="mt-4 font-semibold text-slate-950">Submissions</h2>
          <p className="mt-2 text-sm text-slate-500">Submit or grade work.</p>
          <Link href="/submissions">
            <Button className="mt-4" variant="secondary">Open</Button>
          </Link>
        </Card>
        {user?.role === "Admin" ? (
          <Card className="border-rose-100/80 bg-rose-50/75">
            <ShieldCheck className="h-6 w-6 text-rose-700" />
            <h2 className="mt-4 font-semibold text-slate-950">Admin</h2>
            <p className="mt-2 text-sm text-slate-500">Manage platform users.</p>
            <Link href="/admin/users">
              <Button className="mt-4" variant="secondary">Open</Button>
            </Link>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
