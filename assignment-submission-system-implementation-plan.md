# Assignment & Submission Management System — Implementation Plan

**Prepared for:** OnnoRokom Projukti Limited — Assistant Software Engineer Recruitment Project
**Stack:** ASP.NET Core Web API (C#) · Next.js/React/TypeScript · PostgreSQL · JWT Auth
**Submission deadline:** 14 August 2026
**Plan drafted:** 6 August 2026 (8 working days remaining)

---

## 0. Reality Check Before You Start

You have **8 days**. That changes the engineering calculus versus a normal greenfield project:

- Don't build a 4-layer Clean Architecture with CQRS/MediatR "for scale." A pragmatic **3-layer layered architecture** (API → Application/Services → Data/EF Core) is faster to build, easier to test in the time you have, and still demonstrates good separation of concerns to an evaluator. Over-engineering here is a bigger risk than under-engineering.
- Backend first, always. The rubric explicitly says *"Role-based access is enforced by the backend API"* and *"Important business rules are implemented and tested."* That's where marks are lost or won. Frontend can be comparatively thin (clean, functional, responsive) without hurting you much — a broken or unauthorized backend hurts you a lot.
- PostgreSQL over MongoDB. This domain (Users, Classes, Subjects, Assignments, Submissions) is inherently relational with clear foreign keys and constraints (e.g., "marks ≤ maxMarks", "one submission per student per assignment"). EF Core + PostgreSQL gets you migrations, relational integrity, and less code than hand-rolling equivalent checks in MongoDB.
- Write tests **as you build each business rule**, not in a batch at the end. You will run out of time otherwise, and the rubric wants tests over "authorization" and "submission workflows" specifically — not just CRUD happy paths.

---

## 1. Tech Stack Decisions

| Layer | Choice | Notes |
|---|---|---|
| Backend | ASP.NET Core 8 Web API (C#) | LTS, minimal hosting model, native `Microsoft.AspNetCore.Authentication.JwtBearer` |
| ORM | EF Core 8 + Npgsql provider | Code-first migrations, satisfies "evaluator sets up DB without manual table creation" |
| Database | PostgreSQL 16 | Relational integrity for FK-heavy domain |
| Auth | ASP.NET Core Identity (or lightweight custom user store) + JWT Bearer | Identity gives you password hashing, lockout, etc. for free — recommended even though it adds a little setup time |
| Validation | FluentValidation | Cleaner than data annotations for cross-field rules (e.g., marks ≤ maxMarks) |
| Logging | Serilog → Console + rolling file sink | Structured logs, easy to demo |
| API docs | Swashbuckle (Swagger/OpenAPI) with JWT bearer scheme configured | Required by spec |
| Testing | xUnit + Moq + FluentAssertions + EF Core InMemory (or SQLite in-memory) | Fast, no external DB needed to run tests |
| Frontend | Next.js 14 (App Router) + React + TypeScript | As specified |
| Containerization (optional) | Docker + docker-compose (API + Postgres + optional frontend) | Big "easy local setup" win for evaluators, low cost if you script it early |

---

## 2. High-Level Architecture

```
/backend
  /src
    Assignment.Api            → Controllers, Program.cs, middleware, DI wiring, Swagger config
    Assignment.Application    → Services (interfaces + implementations), DTOs, FluentValidation validators, business rules
    Assignment.Domain         → Entities, enums, domain constants (no EF/infra dependencies)
    Assignment.Infrastructure → DbContext, EF configurations, repositories, Identity setup, migrations
  /tests
    Assignment.UnitTests       → Service-layer + business-rule tests (mocked repos)
    Assignment.IntegrationTests (optional, time-permitting) → WebApplicationFactory + in-memory DB, full pipeline incl. auth
```

**Why 4 small projects instead of 1 monolith project:** it costs you ~20 minutes of setup and immediately signals "this candidate understands separation of concerns" to a reviewer skimming the repo — cheap win. If you're truly time-crunched, folder-based separation inside one project is an acceptable fallback (documented as an assumption in the README).

**Request pipeline (Program.cs) — the order matters, get this right:**

```
UseSerilogRequestLogging()
  → UseExceptionHandler / custom GlobalExceptionMiddleware (catches everything below it)
  → UseSwagger / UseSwaggerUI (dev only)
  → UseHttpsRedirection
  → UseRouting
  → UseCors
  → UseAuthentication      ← must come before UseAuthorization
  → UseAuthorization
  → MapControllers
```

A very common mistake in take-home projects: registering `UseAuthorization` before `UseAuthentication`, which silently breaks role checks. Verify this explicitly.

---

## 3. Data Model

### 3.1 Core Entities

**User**
- Id (Guid, PK)
- FullName
- Email (unique, indexed)
- PasswordHash
- Role (enum: Admin, Teacher, Student) — see note below on modeling roles
- IsActive (bool)
- CreatedAt

> **Role modeling decision:** Use a single `Role` enum column on `User` rather than ASP.NET Identity's full `IdentityRole` many-to-many role table. This system has exactly 3 fixed roles with no runtime role management requirement — a full RBAC table is unused flexibility that costs setup time. Document this as an assumption in the README. If you do use `Microsoft.AspNetCore.Identity`, you can still constrain it to 3 seeded roles; either approach is defensible.

**ClassCourse** (named to avoid the reserved word `Class`)
- Id, Name (e.g., "Grade 10"), Section (e.g., "A"), AcademicYear

**Subject**
- Id, Name, Code, ClassCourseId (FK) — a subject belongs to one class in this simplified model; document as an assumption

**TeacherSubjectAssignment** (Admin assigns teachers → subjects)
- Id, TeacherId (FK → User), SubjectId (FK), ClassCourseId (FK)
- Unique constraint on (TeacherId, SubjectId, ClassCourseId)

**StudentEnrollment** (which class a student belongs to)
- Id, StudentId (FK → User, unique — one class per student), ClassCourseId (FK)

**Assignment**
- Id, Title, Description, SubjectId (FK), ClassCourseId (FK), TeacherId (FK → User)
- Deadline (DateTimeOffset — **store as UTC, always**)
- MaxMarks (int, > 0)
- Status (enum: Draft, Published)
- AllowLateSubmission (bool, default false)
- AllowResubmission (bool, default true) — governs whether a student can update before deadline
- CreatedAt, UpdatedAt

**Submission**
- Id, AssignmentId (FK), StudentId (FK → User)
- Content (text) and/or FileUrl (string, nullable) — text answer is enough for MVP; file upload is a stretch goal (see §10)
- SubmittedAt, LastUpdatedAt
- IsLate (bool, computed at submit time and stored — don't recompute dynamically, it should reflect the actual submit moment)
- Status (enum: Submitted, UnderReview, Graded, ReturnedForRevision)
- Marks (int?, nullable until graded)
- Feedback (text, nullable)
- GradedByTeacherId (FK → User, nullable)
- GradedAt (nullable)

**Constraints to enforce at the DB level (not just app level):**
- Unique index on `(AssignmentId, StudentId)` in `Submission` — one submission record per student per assignment (updates mutate the same row, don't create new rows)
- Check constraint: `Marks IS NULL OR (Marks >= 0 AND Marks <= (assignment's MaxMarks))` — this specific one can't be a simple CHECK since it crosses tables; enforce it in the Application layer service + cover with a unit test, and optionally a trigger if you want to be thorough (not required)
- FK cascade behavior: deleting a User should be restricted (or soft-delete via `IsActive`) rather than cascading through assignments/submissions — avoid `ON DELETE CASCADE` on User relationships

### 3.2 Entity Relationship Summary

```
User (Teacher) 1───* TeacherSubjectAssignment *───1 Subject
User (Student) 1───1 StudentEnrollment *───1 ClassCourse
ClassCourse 1───* Subject
ClassCourse 1───* Assignment *───1 Subject
User (Teacher) 1───* Assignment
Assignment 1───* Submission *───1 User (Student)
User (Teacher) 1───* Submission (as grader, via GradedByTeacherId)
```

---

## 4. Role & Permission Matrix (this is your authorization spec — build policies from this table directly)

| Action | Admin | Teacher | Student |
|---|---|---|---|
| Manage users (create/deactivate) | ✅ | ❌ | ❌ |
| Manage classes/subjects | ✅ | ❌ | ❌ |
| Assign teacher → subject/class | ✅ | ❌ | ❌ |
| View all assignments/submissions (any class) | ✅ | ❌ (only own) | ❌ (only own class/own submissions) |
| Create/update/delete assignment | ❌ | ✅ (only for subjects assigned to them) | ❌ |
| Publish/unpublish assignment | ❌ | ✅ (own only) | ❌ |
| View assignments for own class | ❌ (uses admin view instead) | N/A | ✅ (published only) |
| Submit / update submission | ❌ | ❌ | ✅ (own only, before deadline unless late allowed) |
| Grade submission (marks + feedback) | ❌ | ✅ (own assignments only) | ❌ |
| Change submission status | ❌ | ✅ (own assignments only) | ❌ |
| View own submission status/marks/feedback | ❌ | N/A | ✅ (own only) |

This table becomes both your **ASP.NET authorization policies** and your **unit test matrix** — for every ❌ cell, you should have a test asserting a 403 is returned.

---

## 5. Critical Business Rules (backend must enforce all of these — this is where most take-home submissions lose marks)

1. **Draft assignments are invisible to students.** A `GET /assignments` call from a Student must filter `Status == Published` at the query level, not just hide it in the UI.
2. **A teacher can only touch assignments/subjects they're assigned to.** Enforced by checking `TeacherSubjectAssignment` before allowing create/update/delete/grade — not just checking `Assignment.TeacherId == currentUser.Id` (a teacher shouldn't even be able to create an assignment for a subject they were never assigned, regardless of ownership of the row afterward).
3. **A student can only submit to assignments for their own class.** Cross-check `StudentEnrollment.ClassCourseId == Assignment.ClassCourseId`.
4. **Deadline enforcement on submit:**
   - If `now > Deadline` and `AllowLateSubmission == false` → reject with 400/409, clear error message.
   - If `now > Deadline` and `AllowLateSubmission == true` → accept, but mark `IsLate = true`.
5. **Deadline enforcement on update:** allow updating an existing submission only if `now <= Deadline` **and** `Assignment.AllowResubmission == true`. Once graded (`Status == Graded`), block further student edits regardless of deadline.
6. **Marks validation:** `0 <= Marks <= Assignment.MaxMarks`. Reject grading requests outside this range with a descriptive validation error (this is the single most likely "gotcha" a reviewer will specifically test).
7. **One submission per student per assignment.** Submitting twice updates the existing row (upsert semantics), it does not create duplicates.
8. **A student cannot view another student's submission**, even by guessing an ID (IDOR check — verify `Submission.StudentId == currentUser.Id` server-side on every read, not just on write).
9. **A teacher cannot grade a submission belonging to an assignment they don't own.**
10. **Status transitions are meaningful**, not free-for-all: e.g., `Submitted/UnderReview → Graded` or `→ ReturnedForRevision → (student resubmits) → UnderReview` is a sane state machine. Pick one, document it in the README, and enforce illegal transitions being rejected.

Each numbered rule above should map to at least one xUnit test. This is explicitly graded ("Important business rules are implemented and tested").

---

## 6. API Surface (representative — exact routes are yours to finalize, keep REST conventions)

```
Auth
  POST   /api/auth/login
  POST   /api/auth/refresh              (optional, if you implement refresh tokens)

Admin
  GET    /api/admin/users
  POST   /api/admin/users
  PATCH  /api/admin/users/{id}/deactivate
  GET    /api/admin/classes
  POST   /api/admin/classes
  POST   /api/admin/subjects
  POST   /api/admin/teacher-assignments        (assign teacher → subject/class)
  GET    /api/admin/assignments                (view all, any class)
  GET    /api/admin/submissions                (view all)

Teacher
  GET    /api/teacher/assignments               (own only)
  POST   /api/teacher/assignments
  PUT    /api/teacher/assignments/{id}
  DELETE /api/teacher/assignments/{id}
  PATCH  /api/teacher/assignments/{id}/publish
  GET    /api/teacher/assignments/{id}/submissions
  PUT    /api/teacher/submissions/{id}/grade     (marks + feedback)
  PATCH  /api/teacher/submissions/{id}/status

Student
  GET    /api/student/assignments                (own class, published only)
  GET    /api/student/assignments/{id}
  POST   /api/student/assignments/{id}/submit
  PUT    /api/student/submissions/{id}            (update before deadline)
  GET    /api/student/submissions                 (own only, incl. marks/feedback)
```

Every endpoint under `/admin`, `/teacher`, `/student` gets `[Authorize(Roles = "...")]` or a named policy, **plus** an ownership/scope check inside the handler where the role alone isn't sufficient (rules 2, 3, 8, 9 above).

---

## 7. Phase-by-Phase Plan

### Phase 0 — Project Setup & Scaffolding (Day 1, morning)
- Create solution + 4 backend projects (Api, Application, Domain, Infrastructure) + 2 test projects
- Set up PostgreSQL locally (or via docker-compose) and confirm connection string works
- Configure Serilog, base `Program.cs` middleware pipeline (get the ordering right now, from §2)
- Configure Swashbuckle with JWT bearer support in Swagger UI
- Initialize Next.js project with TypeScript, ESLint, base folder structure
- Set up `.gitignore`, `.env.example`, initial README skeleton
- **Deliverable:** empty-but-running API returning 200 on a health check endpoint, empty-but-running Next.js app, both committed.

### Phase 1 — Domain Model & Database (Day 1 afternoon – Day 2)
- Define all entities in `Assignment.Domain` (§3.1), enums for Role/Status
- Configure EF Core mappings (Fluent API preferred over data annotations for clarity), including the unique constraints and FK behaviors from §3.1
- Write initial migration, apply it, confirm schema in PostgreSQL
- Write a seed script/`DbSeeder` that creates: 1 Admin, 2 Teachers, 3–4 Students, 2 classes, a few subjects, teacher-subject assignments, a few sample assignments — this becomes both your demo data **and** your integration test fixtures
- **Deliverable:** `dotnet ef database update` produces a fully working schema from scratch; seed data loads cleanly.

### Phase 2 — Authentication & Authorization (Day 2–3)
- Implement password hashing (ASP.NET Identity's `PasswordHasher<User>` is fine even without full Identity)
- `POST /api/auth/login` → validates credentials, issues JWT with claims: `sub` (UserId), `role`, and optionally `classId` for students
- Configure `AddAuthentication().AddJwtBearer(...)` with proper `TokenValidationParameters` (validate issuer, audience, lifetime, signing key)
- Define authorization policies per role (`RequireAdmin`, `RequireTeacher`, `RequireStudent`) or use `[Authorize(Roles = "Teacher")]` directly — policies are cleaner if you need combined roles anywhere
- Build a reusable `ICurrentUserService` (reads claims from `HttpContext`) so services don't parse claims directly — makes unit testing much easier (mock the interface instead of `HttpContext`)
- **Deliverable:** login returns a valid JWT; a protected test endpoint correctly returns 401 with no token and 403 with wrong role.
- **Test now:** write auth/authz unit tests immediately — don't defer.

### Phase 3 — Admin Module (Day 3)
- User management endpoints (create teacher/student accounts — no public self-registration per the role brief)
- Class/Subject CRUD
- Teacher-subject assignment endpoint (enforce the unique constraint gracefully — return a clean 409 on duplicate, not a raw DB exception)
- Admin read-all endpoints for assignments/submissions
- **Deliverable:** Admin can fully provision the system through the API (this is what your seeder replaces for demo purposes, but the endpoints should still exist and work).

### Phase 4 — Teacher Module: Assignments (Day 4)
- Create/update/delete assignment, **with the ownership check from business rule #2** (teacher must have a `TeacherSubjectAssignment` for the subject+class combination)
- Publish/unpublish toggle
- FluentValidation validators: Title required, Deadline must be in the future on create, MaxMarks > 0
- List own assignments, with filtering by class/subject/status (basic query params)
- **Deliverable + tests:** unauthorized-teacher-cannot-touch-others-assignment test, validation tests, draft-vs-published visibility test.

### Phase 5 — Student Module: Submissions (Day 5)
- List assignments for own class (published only — rule #1)
- Submit endpoint — enforce rules #3, #4, #7 (class match, deadline/late logic, upsert-not-duplicate)
- Update-submission endpoint — enforce rule #5 (deadline + AllowResubmission + not-yet-graded)
- View own submissions with status/marks/feedback — enforce rule #8 (IDOR protection)
- **Deliverable + tests:** deadline edge cases (exactly-at-deadline, after with/without AllowLateSubmission), duplicate-submit-upserts test, cross-student-access-denied test.

### Phase 6 — Teacher Module: Grading (Day 5–6)
- Grade endpoint: enforce rule #6 (marks bounds) and rule #9 (ownership)
- Status transition endpoint: enforce rule #10 (valid state machine only)
- **Deliverable + tests:** marks-out-of-range rejected, grading-someone-else's-submission rejected, illegal-status-transition rejected.

### Phase 7 — Cross-Cutting Hardening (Day 6)
- Global exception-handling middleware → consistent `ProblemDetails` JSON error shape across the API (don't leak stack traces in responses; do log them via Serilog)
- Structured request logging (method, path, status code, duration, userId if authenticated)
- Input validation failures return 400 with field-level messages (FluentValidation + a validation filter/pipeline behavior)
- Re-verify every endpoint has the correct `[Authorize]` attribute — do a manual pass over the full route table, this is easy to miss on 1–2 endpoints under time pressure
- Finalize Swagger: XML doc comments on controllers/DTOs, "Authorize" button wired to JWT bearer scheme so evaluators can test through Swagger UI directly
- **Deliverable:** hitting every protected route unauthenticated returns 401 uniformly; hitting with wrong role returns 403 uniformly; validation errors are structured, not raw exceptions.

### Phase 8 — Unit Tests: Fill Gaps & Consolidate (Day 6–7)
- Cross-check the test suite against the rule list in §5 and the permission matrix in §4 — fill any untested cell
- Aim for coverage of: business rules (all 10), authorization (every ❌ cell in §4 has a corresponding denial test), and core CRUD happy paths
- If time allows, add a small integration test suite using `WebApplicationFactory<Program>` + EF Core InMemory provider to test 2–3 full request pipelines end-to-end (login → create assignment → submit → grade) — this is a strong signal of engineering maturity but is a **stretch goal**, not a blocker
- **Deliverable:** `dotnet test` runs clean, and you can point to specific test names in the README that map to specific business rules.

### Phase 9 — Frontend Integration (Day 7, running in parallel where possible from Day 4 onward)
- Auth pages (login), role-based route guarding, JWT stored appropriately (httpOnly cookie preferred over localStorage if time allows; localStorage is an acceptable documented shortcut)
- Admin: user/class/subject management screens
- Teacher: assignment CRUD, submission list + grading form
- Student: assignment list, submission form, status/marks view
- Basic responsive layout, form validation matching backend rules (don't duplicate business logic, just surface backend validation errors cleanly)
- **Deliverable:** all three roles can complete their full workflow end-to-end through the UI against the real backend.

### Phase 10 — Packaging, Docs & Submission (Day 8)
- Write the full README: overview, features, tech stack, project structure, setup instructions (backend + frontend + DB), how to run tests, **assumptions**, **known limitations**, demo credentials for all 3 roles
- `.env.example` for both backend and frontend, confirm no real secrets are committed (grep the repo for accidental connection strings/keys before pushing)
- Optional: `docker-compose.yml` for API + Postgres, one-command local spin-up — high value-to-effort ratio if you have a spare few hours
- Run the Final Checklist in §9 below literally, item by item, on a clean clone of the repo (not your dev machine — a folder freshly cloned) to catch "works on my machine" setup gaps
- Push, submit repo link via the provided submission form

---

## 8. Suggested Day-by-Day Schedule (8 days to 14 Aug)

| Day | Focus |
|---|---|
| 1 | Phase 0 + start Phase 1 |
| 2 | Finish Phase 1, Phase 2 (auth) |
| 3 | Phase 2 tests, Phase 3 (admin) |
| 4 | Phase 4 (teacher assignments) + start frontend scaffolding |
| 5 | Phase 5 (student submissions) + Phase 6 start |
| 6 | Finish Phase 6, Phase 7 (hardening), Phase 8 start |
| 7 | Phase 8 finish, Phase 9 (frontend integration) |
| 8 | Phase 10 (README, cleanup, Docker if time, final checklist, submit — with a buffer, don't submit at 11:59) |

If something has to be cut under time pressure, cut in this order: Docker/compose → integration tests → refresh tokens → resubmission workflow niceties → admin UI polish. **Never cut**: role-based authorization enforcement, deadline/marks business rules, or the unit tests for both.

---

## 9. Final Checklist (mirrors the assignment's own checklist — verify against a fresh clone)

- [ ] Repo is accessible (correct visibility/permissions)
- [ ] Frontend and backend both present and buildable
- [ ] `dotnet ef database update` (or provided script) builds schema from nothing
- [ ] Seed data provides working credentials for Admin, Teacher, Student
- [ ] README covers: overview, features, stack, structure, setup (BE+FE+DB), test instructions, assumptions, limitations
- [ ] Every protected endpoint verified to enforce role AND ownership/scope checks
- [ ] Business rules from §5 all have passing tests
- [ ] `.env.example` present; `git log`/`git grep` shows no committed secrets
- [ ] `dotnet test` and frontend build both run clean on a fresh clone

---

## 10. Explicitly Out of Scope for the 8-Day Window (mention these as "known limitations" in the README, don't attempt them)

- File upload for submissions (text-only answer field is sufficient and defensible — note it as a deliberate scope cut)
- Email notifications
- Refresh token rotation / advanced session management
- Multi-class-per-subject or multi-subject-per-class flexibility (current model assumes one subject → one class, documented as an assumption)
- Pagination/advanced filtering beyond basic query params (optional per the brief anyway)

Listing these explicitly and *why* you cut them reads far better to an evaluator than silently omitting them — it shows judgment under a real constraint, which is exactly what an Assistant Software Engineer role tests for.
