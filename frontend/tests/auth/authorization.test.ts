import { describe, expect, it } from "vitest";
import { canAccess } from "@/lib/auth";
import type { AuthUser } from "@/types/auth";

const baseUser: AuthUser = {
  token: "token",
  userId: "11111111-1111-1111-1111-111111111111",
  firstName: "Ayesha",
  lastName: "Rahman",
  email: "ayesha@example.com",
  role: "Student",
};

describe("role authorization", () => {
  it("requires a signed-in user", () => {
    expect(canAccess(null)).toBe(false);
  });

  it("allows unrestricted protected screens to any role", () => {
    expect(canAccess(baseUser)).toBe(true);
  });

  it("does not let admins inherit teacher permission", () => {
    expect(canAccess({ ...baseUser, role: "Admin" }, ["Teacher"])).toBe(false);
  });
});
