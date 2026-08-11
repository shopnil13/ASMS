"use client";

import Link from "next/link";
import { LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 shadow-sm shadow-slate-200/50 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="font-semibold text-slate-950 lg:hidden">
          ASMS
        </Link>
        <div className="hidden text-sm font-medium text-slate-600 lg:block">
          ASP.NET Core API connected through JWT Bearer authentication
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <UserCircle className="h-5 w-5 text-slate-400" />
              <div className="text-right">
                <p className="text-sm font-medium text-slate-950">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
            </div>
            <Button type="button" variant="ghost" icon={<LogOut className="h-4 w-4" />} onClick={logout}>
              Logout
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
