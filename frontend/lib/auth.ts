import type { AuthUser, UserRole } from "@/types/auth";

export const roles: UserRole[] = ["Student", "Teacher", "Admin"];

export function canAccess(user: AuthUser | null, allowedRoles?: UserRole[]) {
  if (!user) {
    return false;
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  return allowedRoles.includes(user.role);
}

export function roleDescription(role: UserRole) {
  const copy: Record<UserRole, string> = {
    Student: "Submit work and track grading feedback.",
    Teacher: "Manage courses, assignments, and grading.",
    Admin: "Manage users and platform access.",
  };

  return copy[role];
}
