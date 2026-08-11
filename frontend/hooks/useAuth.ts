"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api, { getApiErrorMessage } from "@/lib/api";
import { clearSession, getStoredUser, setSession } from "@/lib/storage";
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  UserRole,
} from "@/types/auth";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const ready = true;

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated: Boolean(user),
      hasRole: (roles: UserRole[]) => Boolean(user && roles.includes(user.role)),
      async login(request: LoginRequest) {
        const { data } = await api.post<AuthUser>("/Auth/login", request);
        setSession(data);
        setUser(data);
        return data;
      },
      async register(request: RegisterRequest) {
        const { data } = await api.post<RegisterResponse>(
          "/Auth/register",
          request,
        );
        return data;
      },
      logout() {
        clearSession();
        setUser(null);
        router.push("/login");
      },
      getError(error: unknown, fallback: string) {
        return getApiErrorMessage(error, fallback);
      },
    }),
    [ready, router, user],
  );

  return value;
}
