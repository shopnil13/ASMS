"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginResponse } from "@/types/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<LoginResponse | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [router]);

  if (!user) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user.firstName}!
        </h1>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <p>
            <strong>Name:</strong> {user.firstName} {user.lastName}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>
      </div>
    </main>
  );
}