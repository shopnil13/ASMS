# Assignment Submission Management System (ASMS)

ASMS is a full-stack assignment submission management system for students, teachers, and admins. The backend is an ASP.NET Core Web API with PostgreSQL, JWT authentication, and role-based authorization. The frontend is a Next.js, React, and TypeScript application that mirrors the backend business rules.

## Main Features

- Student registration and JWT login.
- Role-based access for Student, Teacher, and Admin users.
- Course management for teachers.
- Assignment management for teachers.
- Student PDF assignment submission with optional notes.
- Inline PDF preview for submitted work.
- Explicit PDF download action per submission.
- Teacher grading with marks and feedback.
- Admin user management and role updates.
- Responsive, modern frontend UI.
- Frontend validation with Zod and React Hook Form.
- Frontend unit tests with Vitest and Testing Library.

## Technology Stack

- Backend: ASP.NET Core 8 Web API, C#, Entity Framework Core.
- Database: PostgreSQL.
- Authentication: JWT Bearer authentication.
- Frontend: Next.js 16, React 19, TypeScript.
- Styling: Tailwind CSS.
- Forms and validation: React Hook Form, Zod.
- HTTP client: Axios.
- Icons: lucide-react.
- Testing: Vitest, Testing Library, ESLint.

## Project Structure

```text
ASMS/
├── backend/
│   ├── AssignmentManagement.sln
│   └── src/
│       ├── Assignment.Api/
│       ├── Assignment.Application/
│       ├── Assignment.Domain/
│       └── Assignment.Infrastructure/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── schemas/
│   ├── tests/
│   ├── types/
│   └── package.json
│
└── README.md
```

## Setup Instructions

Required tools:

- .NET 8 SDK
- Node.js and npm
- PostgreSQL
- EF Core CLI tools

Install EF Core CLI if needed:

```bash
dotnet tool install --global dotnet-ef
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Restore backend dependencies:

```bash
cd backend
dotnet restore AssignmentManagement.sln
```

## Database Setup

The backend expects PostgreSQL to be running locally.

Default connection string location:

```text
backend/src/Assignment.Api/appsettings.json
```

Default database:

```text
AssignmentManagementDb
```

Apply migrations:

```bash
dotnet ef database update --project backend/src/Assignment.Infrastructure --startup-project backend/src/Assignment.Api --context ApplicationDbContext
```

PDF submissions are stored on disk under:

```text
backend/src/Assignment.Api/SubmissionFiles/
```

## Running The Backend

From the repo root:

```bash
cd backend/src/Assignment.Api
dotnet run --launch-profile http
```

Backend URLs:

- API: `http://localhost:5025/api`
- Swagger: `http://localhost:5025/swagger`

## Running The Frontend

From the repo root:

```bash
cd frontend
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

The frontend defaults to this API base URL:

```text
http://localhost:5025/api
```

To override it, set:

```text
NEXT_PUBLIC_API_BASE_URL
```

## Running Tests

Frontend lint:

```bash
cd frontend
npm run lint
```

Frontend tests:

```bash
cd frontend
npm test
```

Frontend production build:

```bash
cd frontend
npm run build
```

Backend build:

```bash
dotnet build backend/AssignmentManagement.sln
```

## Known Limitations

- The backend stores uploaded PDFs on local disk, not cloud/object storage.
- There is no pagination or search for courses, assignments, users, or submissions.
- The assignment dashboard checks submitted status by querying each assignment for the current student.
- There is no password reset flow.
- There is no user profile or `/api/Auth/me` endpoint.
- Admin delete is a hard delete and may be blocked by course or submission dependencies.
