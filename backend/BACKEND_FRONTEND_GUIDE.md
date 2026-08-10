# Backend API Guide for Frontend Developers

This backend is an ASP.NET Core 8 Web API for an assignment submission system. It uses PostgreSQL through Entity Framework Core, JWT bearer authentication, and role-based authorization.

## Project Layout

```text
backend/
  AssignmentManagement.sln
  src/
    Assignment.Api/              HTTP API, controllers, auth middleware, Swagger
    Assignment.Application/      DTOs, service interfaces, application services
    Assignment.Domain/           Entities and enums
    Assignment.Infrastructure/   EF Core DbContext, migrations, service implementations
```

Main API entry point: `src/Assignment.Api/Program.cs`

## Local API URL

Launch profiles define these local URLs:

```text
HTTP:  http://localhost:5025
HTTPS: https://localhost:7047
Swagger: /swagger
```

Typical local run command:

```bash
cd backend/src/Assignment.Api
dotnet run
```

The configured PostgreSQL database is `AssignmentManagementDb` on `localhost:5432`. The connection string is currently in `appsettings.json`.

## Authentication

Most endpoints require a JWT token:

```http
Authorization: Bearer <token>
```

The token is returned by `POST /api/Auth/login`.

JWT claims include:

```text
NameIdentifier: user id
Email: user email
Name: first name + last name
Role: Student, Teacher, or Admin
```

Token lifetime is configured as `Jwt:ExpirationMinutes`, currently `60` minutes.

Important role behavior:

- Registration always creates a `Student`.
- Admin users can create `Student`, `Teacher`, and `Admin` accounts through the Admin user-management API.
- Admin does not automatically inherit Teacher permissions. Existing course, assignment, and grading mutations are still Teacher-only unless an endpoint explicitly allows Admin.

## Common Response Notes

JSON property names are serialized by ASP.NET Core's default web settings, so frontend code should expect camelCase:

```json
{
  "userId": "guid",
  "firstName": "Ayesha"
}
```

Date values are `DateTime` values from the server, mostly created with `DateTime.UtcNow`. Treat API dates as UTC unless the backend later adds explicit timezone handling.

Validation failures from `[ApiController]` and data annotations return automatic `400 Bad Request` responses with validation details.

Standard error bodies in controllers usually look like:

```json
{
  "message": "Course not found."
}
```

## Auth Endpoints

### Register Student

```http
POST /api/Auth/register
```

Request:

```json
{
  "firstName": "Ayesha",
  "lastName": "Rahman",
  "email": "ayesha@example.com",
  "password": "Password123!"
}
```

Success: `200 OK`

```json
{
  "id": "guid",
  "firstName": "Ayesha",
  "lastName": "Rahman",
  "email": "ayesha@example.com",
  "role": "Student"
}
```

Errors:

- `409 Conflict` when email already exists.
- `400 Bad Request` for validation/model binding issues.

### Login

```http
POST /api/Auth/login
```

Request:

```json
{
  "email": "ayesha@example.com",
  "password": "Password123!"
}
```

Success: `200 OK`

```json
{
  "token": "jwt-token",
  "userId": "guid",
  "firstName": "Ayesha",
  "lastName": "Rahman",
  "email": "ayesha@example.com",
  "role": "Student"
}
```

Frontend should persist the token in its auth state and send it on protected requests.

Current caveat: invalid login throws `UnauthorizedAccessException` in the service, but the controller does not catch it. Until backend error middleware is added, this may appear as a server error instead of a clean `401`.

## Admin User Endpoints

All Admin user endpoints require authentication and the `Admin` role.

```http
Authorization: Bearer <admin-token>
```

Admin endpoints are intentionally separate from Teacher endpoints. Admin can manage users, but Admin is not currently allowed to create assignments, grade submissions, or manage a teacher's course through the Teacher-only endpoints.

### List Users

```http
GET /api/Admin/users
```

Success: `200 OK`

```json
[
  {
    "id": "guid",
    "firstName": "Ayesha",
    "lastName": "Rahman",
    "email": "ayesha@example.com",
    "role": "Student",
    "createdAt": "2026-08-10T14:00:00Z"
  }
]
```

### Get User

```http
GET /api/Admin/users/{id}
```

Success: `200 OK`

```json
{
  "id": "guid",
  "firstName": "Ayesha",
  "lastName": "Rahman",
  "email": "ayesha@example.com",
  "role": "Student",
  "createdAt": "2026-08-10T14:00:00Z"
}
```

Errors:

- `404 Not Found` when the user does not exist.

### Create User

```http
POST /api/Admin/users
```

Request:

```json
{
  "firstName": "Nadia",
  "lastName": "Islam",
  "email": "nadia@example.com",
  "password": "Password123!",
  "role": "Teacher"
}
```

Allowed role values:

```text
Student
Teacher
Admin
```

Role parsing is case-insensitive, but the frontend should send the canonical values above.

Success: `201 Created`

```json
{
  "id": "guid",
  "firstName": "Nadia",
  "lastName": "Islam",
  "email": "nadia@example.com",
  "role": "Teacher",
  "createdAt": "2026-08-10T14:00:00Z"
}
```

Errors:

- `400 Bad Request` when the role is invalid or validation fails.
- `409 Conflict` when email already exists.

### Change User Role

```http
PUT /api/Admin/users/{id}/role
```

Request:

```json
{
  "role": "Admin"
}
```

Success: `200 OK`

Returns the updated user response.

Errors:

- `400 Bad Request` when the role is invalid.
- `404 Not Found` when the user does not exist.

### Delete User

```http
DELETE /api/Admin/users/{id}
```

Success: `204 No Content`

Errors:

- `400 Bad Request` when an admin tries to delete their own account.
- `404 Not Found` when the user does not exist.
- `409 Conflict` when the user is linked to courses or submissions.

Delete is intentionally blocked for users with existing course/submission dependencies because the database restricts deleting course teachers and submission students.

## Course Endpoints

All course endpoints require authentication.

### Create Course

Teacher only.

```http
POST /api/Course
```

Request:

```json
{
  "code": "CSE101",
  "name": "Introduction to Computer Science",
  "description": "Basic programming and computing concepts.",
  "teacherId": "00000000-0000-0000-0000-000000000000"
}
```

Success: `201 Created`

```json
{
  "id": "guid",
  "code": "CSE101",
  "name": "Introduction to Computer Science",
  "description": "Basic programming and computing concepts.",
  "teacherId": "teacher-user-guid",
  "createdAt": "2026-08-10T14:00:00Z"
}
```

Note: `teacherId` is required by the request DTO, but the backend ignores the submitted value and uses the teacher id from the JWT. Frontend can send the logged-in user's id or a placeholder GUID until the DTO is cleaned up.

### List Courses

```http
GET /api/Course
```

Success: `200 OK`

```json
[
  {
    "id": "guid",
    "code": "CSE101",
    "name": "Introduction to Computer Science",
    "description": "Basic programming and computing concepts.",
    "teacherId": "teacher-user-guid",
    "createdAt": "2026-08-10T14:00:00Z"
  }
]
```

### Get Course

```http
GET /api/Course/{id}
```

Errors:

- `404 Not Found` when the course does not exist.

### Update Course

Teacher only. The logged-in teacher must own the course.

```http
PUT /api/Course/{id}
```

Request body is the same as create course.

Errors:

- `404 Not Found` when the course does not exist or the teacher is not the owner.

### Delete Course

Teacher only. The logged-in teacher must own the course.

```http
DELETE /api/Course/{id}
```

Success: `204 No Content`

Errors:

- `404 Not Found` when the course does not exist or the teacher is not the owner.

Database behavior: deleting a course cascades to assignments and submissions through the assignment relationship.

## Assignment Endpoints

All assignment endpoints require authentication.

### Create Assignment

Teacher only. The logged-in teacher must own the course.

```http
POST /api/Assignment
```

Request:

```json
{
  "courseId": "course-guid",
  "title": "Array Practice",
  "description": "Solve the listed array problems.",
  "dueDate": "2026-08-20T23:59:00Z",
  "totalMarks": 100
}
```

Success: `201 Created`

```json
{
  "id": "guid",
  "courseId": "course-guid",
  "title": "Array Practice",
  "description": "Solve the listed array problems.",
  "dueDate": "2026-08-20T23:59:00Z",
  "totalMarks": 100,
  "createdAt": "2026-08-10T14:00:00Z"
}
```

Errors:

- `404 Not Found` when the course does not exist or the teacher is not the owner.

### List Assignments by Course

```http
GET /api/Assignment/course/{courseId}
```

Success: `200 OK`

Returns an array of assignment responses.

### Get Assignment

```http
GET /api/Assignment/{id}
```

Errors:

- `404 Not Found` when the assignment does not exist.

### Update Assignment

Teacher only. The logged-in teacher must own the assignment's course.

```http
PUT /api/Assignment/{id}
```

Request body is the same as create assignment.

Important: the backend does not allow moving an assignment to another course. `courseId` in the request must match the existing assignment's `courseId`.

Errors:

- `404 Not Found` when the assignment does not exist, the teacher is not the owner, or `courseId` does not match the existing course.

### Delete Assignment

Teacher only. The logged-in teacher must own the assignment's course.

```http
DELETE /api/Assignment/{id}
```

Success: `204 No Content`

Errors:

- `404 Not Found` when the assignment does not exist or the teacher is not the owner.

Database behavior: deleting an assignment cascades to submissions.

## Submission Endpoints

All submission endpoints require authentication.

### Create Submission

Student only.

```http
POST /api/Submission
```

Request:

```json
{
  "assignmentId": "assignment-guid",
  "content": "My submitted answer..."
}
```

Success: `201 Created`

```json
{
  "id": "guid",
  "assignmentId": "assignment-guid",
  "studentId": "student-user-guid",
  "content": "My submitted answer...",
  "submittedAt": "2026-08-10T14:00:00Z",
  "marksObtained": null,
  "feedback": null,
  "createdAt": "2026-08-10T14:00:00Z"
}
```

Errors:

- `400 Bad Request` when the assignment does not exist or the student already submitted.

Database rule: one submission per student per assignment.

### Get Submission

Student or teacher.

```http
GET /api/Submission/{id}
```

Access rules:

- A student can view their own submission.
- A teacher can view a submission if they own the course containing the assignment.

Errors:

- `404 Not Found` when the submission does not exist or the user does not have access.

### List Submissions by Assignment

Teacher only.

```http
GET /api/Submission/assignment/{assignmentId}
```

Success: `200 OK`

Returns an array of submission responses.

Current caveat: the controller only checks that the user has the `Teacher` role. The service currently returns submissions for any assignment id without verifying that the teacher owns the course.

### Grade Submission

Teacher only. The logged-in teacher must own the course containing the assignment.

```http
PUT /api/Submission/{id}/grade?marksObtained=85&feedback=Good%20work
```

Parameters are bound from the query string because the action parameters are simple values.

Success: `200 OK`

Returns the updated submission response.

Errors:

- `404 Not Found` when the submission does not exist or the teacher is not the course owner.
- Current caveat: marks outside `0..assignment.totalMarks` throw `ArgumentOutOfRangeException`; until backend error middleware is added, this may appear as a server error instead of a clean `400`.

## DTO Field Rules

### Admin CreateUserRequest

```text
firstName: required string, max 100
lastName: required string, max 100
email: required email string, max 255, unique in database
password: required string
role: required string, Student | Teacher | Admin
```

### Admin UpdateUserRoleRequest

```text
role: required string, Student | Teacher | Admin
```

### RegisterRequest

```text
firstName: string
lastName: string
email: string
password: string
```

No data annotations are currently defined on this DTO, but the database requires first name, last name, email, password hash, and unique email.

### LoginRequest

```text
email: string
password: string
```

### CreateCourseRequest

```text
code: required string, max 50, unique in database
name: required string, max 200
description: string, max 2000
teacherId: required Guid, currently ignored in favor of JWT user id
```

### CreateAssignmentRequest

```text
courseId: required Guid
title: required string, max 200
description: string, max 5000
dueDate: required DateTime
totalMarks: decimal, range 0.01 to 1000000, database precision 10,2
```

### CreateSubmissionRequest

```text
assignmentId: required Guid
content: required string, DTO max 10000
```

Note: database configuration requires `content` but does not currently set the 10000 character max length at the database level.

## Frontend Integration Checklist

- Store `login.token` and send it as `Authorization: Bearer <token>`.
- Gate UI by `role`: `Student` can submit, `Teacher` can create/update/delete courses and assignments and grade submissions, `Admin` can manage users.
- Do not show Teacher workflows to Admin unless backend permissions are explicitly expanded later.
- Use camelCase request and response fields.
- Send `dueDate` as an ISO string.
- Treat `401`/`403` as auth/session or permission failures.
- Handle `404` with the controller-provided `message`.
- For grading, send `marksObtained` and `feedback` as query parameters, not JSON.
- For create course, include `teacherId` even though the backend derives the real teacher from the token.

## Current Backend Gaps That Affect Frontend Work

- CORS is not configured. A separate frontend dev server may be blocked by the browser unless the backend adds CORS or the frontend uses a proxy.
- Invalid login and invalid grading marks are not converted into clean API error responses yet.
- `GET /api/Submission/assignment/{assignmentId}` does not verify teacher ownership in the service.
- There is no deactivate/restore user flow yet; Admin delete is a hard delete and is blocked when dependencies exist.
- There is no `GET /api/Auth/me` endpoint for refreshing the current user from a token.
- There are no pagination, sorting, or search parameters on list endpoints.
- The existing `.http` file still references the default weather forecast endpoint, which is not present.
