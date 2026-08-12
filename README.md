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
- Database: PostgreSQL locally, Supabase PostgreSQL in production.
- File storage: Local disk in development, Supabase Storage in production.
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

Production PDF submissions should use Supabase Storage instead. Set:

```text
Storage__Provider=Supabase
Supabase__Url=https://YOUR_PROJECT_REF.supabase.co
Supabase__ServiceRoleKey=YOUR_SUPABASE_SERVICE_ROLE_KEY
Supabase__StorageBucket=submissions
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

There is currently no dedicated backend test project in the repository.

## Deployment Plan

The agreed free deployment stack is:

| Layer | Service | Purpose |
| --- | --- | --- |
| Frontend | Vercel | Host the Next.js frontend |
| Backend | Render | Host the ASP.NET Core API |
| Backend packaging | Docker | Reproducible backend deployment |
| Database | Supabase PostgreSQL | Production relational database |
| File storage | Supabase Storage | Private PDF submission storage |
| Source control | GitHub | Repository and deployment integration |

Production flow:

```text
GitHub
├── Vercel: Next.js frontend
└── Render: Dockerized ASP.NET Core API
    ├── Supabase PostgreSQL
    └── Supabase Storage private bucket
```

### Supabase Setup

1. Create a Supabase project.
2. Copy the PostgreSQL connection string.
3. Create a private Storage bucket named `submissions`.
4. Copy the project URL and service role key.
5. Apply EF Core migrations against the Supabase PostgreSQL database:

```bash
dotnet ef database update --project backend/src/Assignment.Infrastructure --startup-project backend/src/Assignment.Api --context ApplicationDbContext
```

Use the Supabase connection string through `ConnectionStrings__DefaultConnection` when applying production migrations.

### Backend Docker

Build the backend image locally:

```bash
docker build -f backend/Dockerfile -t asms-api ./backend
```

Run the image locally:

```bash
docker run --rm -p 8080:8080 --env-file backend/.env.example asms-api
```

For a real run, copy `backend/.env.example` to a private local env file and replace the placeholder values. Do not commit real secrets.

### Render Backend Deployment

Create a Render Web Service from the GitHub repository:

- Environment: Docker
- Dockerfile path: `backend/Dockerfile`
- Docker build context: `backend`
- Health/API check: `https://YOUR_RENDER_SERVICE.onrender.com/swagger`

Required Render environment variables:

```text
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=SUPABASE_POSTGRES_CONNECTION_STRING
Jwt__Key=LONG_RANDOM_SECRET
Jwt__Issuer=AssignmentManagementSystem
Jwt__Audience=AssignmentManagementSystemClient
Jwt__ExpirationMinutes=60
Storage__Provider=Supabase
Supabase__Url=https://YOUR_PROJECT_REF.supabase.co
Supabase__ServiceRoleKey=SUPABASE_SERVICE_ROLE_KEY
Supabase__StorageBucket=submissions
Cors__AllowedOrigins=https://YOUR_VERCEL_APP.vercel.app
```

### Vercel Frontend Deployment

Create a Vercel project from the same GitHub repository:

- Root directory: `frontend`
- Build command: `npm run build`
- Development command: `npm run dev`
- Install command: `npm install`

Required Vercel environment variable:

```text
NEXT_PUBLIC_API_BASE_URL=https://YOUR_RENDER_SERVICE.onrender.com/api
```

After Vercel gives the frontend URL, add that URL to Render as:

```text
Cors__AllowedOrigins=https://YOUR_VERCEL_APP.vercel.app
```

### Deployment Order

1. Prepare Supabase project.
2. Configure Supabase PostgreSQL.
3. Create private Supabase Storage bucket named `submissions`.
4. Apply EF Core migrations to Supabase PostgreSQL.
5. Build and test backend Docker image locally.
6. Push project to GitHub.
7. Deploy Dockerized API to Render.
8. Configure Render environment variables.
9. Deploy frontend to Vercel.
10. Configure `NEXT_PUBLIC_API_BASE_URL` in Vercel.
11. Configure Render CORS for the Vercel URL.
12. Run end-to-end testing for login, courses, assignments, PDF upload, preview, download, and grading.

## Assumptions

- Public registration creates Student accounts only.
- Admin users manage users but do not inherit Teacher permissions.
- Teachers can create, update, and delete only their own courses and assignments.
- Students can submit once per assignment.
- Assignment submissions require a PDF file.
- Submission notes are optional.
- PDF preview and download require authentication.
- Production PDF files are stored in a private Supabase Storage bucket and served only through the API.
- Local development uses frontend ports `3000` or `3001` and backend port `5025`.

## Known Limitations

- Local development stores PDFs on disk unless `Storage__Provider=Supabase` is configured.
- The API reads PDF files into memory when previewing or downloading them; the current upload limit is 25 MB.
- There is no pagination or search for courses, assignments, users, or submissions.
- The assignment dashboard checks submitted status by querying each assignment for the current student.
- There is no password reset flow.
- There is no user profile or `/api/Auth/me` endpoint.
- Admin delete is a hard delete and may be blocked by course or submission dependencies.
- Some backend error handling is still basic for edge cases.
- Backend secrets and connection strings should be moved to user secrets or environment variables before production use.
