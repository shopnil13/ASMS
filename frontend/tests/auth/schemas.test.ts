import { describe, expect, it } from "vitest";
import { assignmentSchema } from "@/schemas/assignment.schema";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";
import { courseSchema } from "@/schemas/course.schema";
import { gradeSchema, submissionSchema } from "@/schemas/submission.schema";

describe("form schemas", () => {
  function pdfFileList() {
    const input = document.createElement("input");
    const file = new File(["%PDF-1.4"], "assignment.pdf", {
      type: "application/pdf",
    });

    input.type = "file";

    Object.defineProperty(input, "files", {
      value: [file],
    });

    return input.files;
  }

  it("validates login input", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "secret" }).success).toBe(true);
  });

  it("matches public registration as a student-safe form", () => {
    expect(
      registerSchema.safeParse({
        firstName: "Ayesha",
        lastName: "Rahman",
        email: "ayesha@example.com",
        password: "Password123!",
      }).success,
    ).toBe(true);
  });

  it("enforces backend DTO field limits", () => {
    expect(courseSchema.safeParse({ code: "", name: "", description: "" }).success).toBe(false);
    expect(
      assignmentSchema.safeParse({
        courseId: "550e8400-e29b-41d4-a716-446655440000",
        title: "Array Practice",
        description: "",
        dueDate: "2026-08-20T23:59",
        totalMarks: 100,
      }).success,
    ).toBe(true);
    expect(
      submissionSchema.safeParse({
        assignmentId: "550e8400-e29b-41d4-a716-446655440000",
        content: "My answer",
        pdfFile: pdfFileList(),
      }).success,
    ).toBe(true);
    expect(gradeSchema.safeParse({ marksObtained: -1, feedback: "" }).success).toBe(false);
  });
});
