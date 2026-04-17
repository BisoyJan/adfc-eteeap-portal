# ETEEAP Gateway Portal — Technical Documentation

> **Version:** 1.0.0
> **Stack:** Laravel 12 · Inertia.js v2 · React 19 · Tailwind CSS v4
> **Last Updated:** June 2025

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Database Schema](#3-database-schema)
4. [API Routes](#4-api-routes)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Key Models & Relationships](#6-key-models--relationships)
7. [Notification System](#7-notification-system)
8. [Testing](#8-testing)
9. [Development Setup](#9-development-setup)
10. [Production Deployment](#10-production-deployment)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. System Overview

The **ETEEAP Gateway Portal** is a portfolio-based evaluation management system for the Expanded Tertiary Education Equivalency and Accreditation Program (ETEEAP). It enables applicants to submit documentary portfolios, administrators to manage the evaluation pipeline, and evaluators to score portfolios against configurable rubric criteria.

### Core Workflow

```
Applicant                    Admin                      Evaluator
─────────                    ─────                      ─────────
Create Portfolio (Draft)
  │
Upload Documents
  │
Submit Portfolio ──────────→ Receive Notification
                              │
                             Assign Evaluator ────────→ Receive Assignment
                              │                          │
                             Set Status: UnderReview     Review Portfolio
                                                         │
                                                        Save Draft Evaluation
                                                         │
                                                        Submit Evaluation
                              │                          │
Receive Notification ←────── Receive Notification ←──── Notify Applicant + Admins
  │
View Evaluation Results      Update Status
                             (Approved / Rejected /
                              Revision Requested)
  │                           │
Receive Status Notification ←─┘
```

### Key Features

| Feature | Description |
|---------|-------------|
| **Portfolio Management** | Applicants create, edit, and submit document portfolios |
| **Document Upload** | Supports PDF, DOC, DOCX, JPG, PNG (max 10 MB per file) |
| **Evaluator Assignment** | Admins assign evaluators to submitted portfolios |
| **Rubric-Based Scoring** | Configurable criteria with weighted scoring (100 points max) |
| **Status Tracking** | 7-state portfolio lifecycle (Draft → Approved/Rejected) |
| **Two-Factor Authentication** | Optional TOTP-based 2FA with recovery codes |
| **In-App Notifications** | Database-driven notification system for workflow events |
| **Reporting & Analytics** | Admin reports with submission trends and evaluator performance |
| **Server-Side Rendering** | SSR enabled via Inertia.js for improved initial load |

---

## 2. Architecture

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend Framework** | Laravel | 12.x |
| **PHP** | PHP | 8.4.11 |
| **Frontend Bridge** | Inertia.js | 2.x |
| **Frontend Framework** | React | 19.x |
| **TypeScript** | TypeScript | 5.7+ |
| **CSS Framework** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui (Radix UI) | New York style |
| **Icons** | Lucide React | 0.475+ |
| **Build Tool** | Vite | 7.x |
| **Authentication** | Laravel Fortify | 1.x |
| **Route Typing** | Laravel Wayfinder | 0.1.x |
| **Code Formatting** | Pint (PHP) / Prettier (JS) | 1.x / 3.x |
| **Linting** | ESLint | 9.x |
| **Testing** | PHPUnit | 11.x |
| **Database** | MySQL (prod) / SQLite in-memory (test) | — |

### Architectural Patterns

| Pattern | Implementation |
|---------|---------------|
| **Server-Side Routing** | Laravel routes with Inertia responses (no client-side router) |
| **Monolith SPA** | Single deployment; Inertia bridges server and client |
| **Role-Based Access** | Custom middleware + Laravel gates |
| **Form Request Validation** | Dedicated request classes for all mutations |
| **Repository-less** | Eloquent models directly in controllers |
| **Factory Pattern** | Model factories for testing and seeding |
| **Enum-Driven State** | PHP backed enums for roles, statuses |
| **Type-Safe Routes** | Wayfinder generates TypeScript route functions |

### Directory Structure

```
adfc-eteeap-portal/
├── app/
│   ├── Actions/Fortify/           # Auth action classes (create user, reset password)
│   ├── Concerns/                  # Shared validation traits
│   │   ├── PasswordValidationRules.php
│   │   └── ProfileValidationRules.php
│   ├── Enums/                     # PHP backed enums
│   │   ├── AssignmentStatus.php
│   │   ├── EvaluationStatus.php
│   │   ├── PortfolioStatus.php
│   │   └── UserRole.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/             # Admin CRUD controllers
│   │   │   ├── Applicant/         # Applicant portfolio controllers
│   │   │   ├── Evaluator/         # Evaluator scoring controllers
│   │   │   ├── Settings/          # Profile, password, 2FA controllers
│   │   │   ├── DocumentDownloadController.php
│   │   │   └── NotificationController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureUserHasRole.php
│   │   │   ├── HandleAppearance.php
│   │   │   └── HandleInertiaRequests.php
│   │   └── Requests/              # Form request validation classes
│   │       ├── Admin/             # 8 form requests
│   │       ├── Applicant/         # 4 form requests
│   │       └── Settings/          # 4 form requests
│   ├── Models/                    # 8 Eloquent models
│   ├── Notifications/             # 4 notification classes
│   └── Providers/                 # App + Fortify service providers
├── bootstrap/
│   ├── app.php                    # Middleware, routing, exceptions
│   └── providers.php              # Service provider registration
├── config/                        # Laravel configuration files
├── database/
│   ├── factories/                 # 8 model factories
│   ├── migrations/                # 14 migration files
│   └── seeders/                   # Database seeder
├── resources/
│   ├── css/app.css                # Tailwind CSS v4 entry point
│   ├── js/
│   │   ├── app.tsx                # Client-side entry point
│   │   ├── ssr.tsx                # SSR entry point
│   │   ├── components/            # Reusable React components
│   │   │   └── ui/                # shadcn/ui primitives
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── layouts/               # App, auth, settings layouts
│   │   ├── lib/                   # Utility functions
│   │   ├── pages/                 # Inertia page components
│   │   ├── types/                 # TypeScript type definitions
│   │   └── wayfinder/             # Generated route functions
│   └── views/app.blade.php        # Root Blade template
├── routes/
│   ├── web.php                    # Main application routes
│   ├── settings.php               # Settings routes
│   └── console.php                # Console commands
├── tests/
│   ├── Feature/                   # 21 feature test files
│   └── Unit/                      # 1 unit test file
└── docs/                          # Documentation
```

### Frontend Entry Flow

```
Browser Request
  └─→ Laravel Route (web.php)
       └─→ Controller returns Inertia::render('page/name', $props)
            └─→ app.blade.php (root Blade shell)
                 └─→ app.tsx (React mount point)
                      └─→ import.meta.glob('./pages/**/*.tsx')
                           └─→ Page Component (wrapped in Layout)
                                └─→ Rendered with shared props (auth, sidebar, flash)
```

### Shared Inertia Props

Every page receives these props via `HandleInertiaRequests` middleware:

```typescript
type SharedData = {
    name: string;              // App name
    auth: {
        user: User;            // Authenticated user
        permissions: {
            manage_users: boolean;
            manage_portfolios: boolean;
            evaluate_portfolios: boolean;
            submit_portfolios: boolean;
            manage_rubrics: boolean;
        };
        notificationCount: number;
    };
    sidebarOpen: boolean;      // Sidebar state from cookie
};
```

---

## 3. Database Schema

### Entity Relationship Diagram

```
┌──────────┐     ┌─────────────┐     ┌────────────────────┐
│  users   │────<│ portfolios  │────<│ portfolio_documents │
│          │     │             │     │                    │
│ id       │     │ id          │     │ id                 │
│ name     │     │ user_id (FK)│     │ portfolio_id (FK)  │
│ email    │     │ title       │     │ document_category  │
│ password │     │ status      │     │   _id (FK)         │
│ role     │     │ admin_notes │     │ file_name          │
│ 2fa cols │     │ submitted_at│     │ file_path          │
└──────┬───┘     └──────┬──────┘     │ file_size          │
       │                │            │ mime_type           │
       │                │            │ notes               │
       │         ┌──────┴──────┐     └────────┬───────────┘
       │         │             │              │
       │    ┌────┴─────────────┴───┐   ┌──────┴────────────┐
       │    │ portfolio_assignments│   │document_categories │
       │    │                      │   │                    │
       ├───<│ evaluator_id (FK)    │   │ id                 │
       └───<│ assigned_by (FK)     │   │ name               │
            │ portfolio_id (FK)    │   │ slug               │
            │ status               │   │ description        │
            │ due_date             │   │ is_required        │
            │ assigned_at          │   │ sort_order         │
            │ completed_at         │   └────────────────────┘
            └──────────┬───────────┘
                       │
                ┌──────┴──────┐     ┌──────────────────┐
                │ evaluations │────<│evaluation_scores  │
                │             │     │                   │
                │ id          │     │ id                │
                │ portfolio_id│     │ evaluation_id(FK) │
                │ evaluator_id│     │ rubric_criteria   │
                │ assignment  │     │   _id (FK)        │
                │   _id (FK)  │     │ score             │
                │ status      │     │ comments          │
                │ total_score │     └─────────┬─────────┘
                │ max_possible│               │
                │ overall_    │        ┌──────┴──────────┐
                │  comments   │        │rubric_criterias │
                │ recommend.  │        │                 │
                │ submitted_at│        │ id              │
                └─────────────┘        │ name            │
                                       │ description     │
                                       │ max_score       │
                                       │ sort_order      │
                                       │ is_active       │
                                       └─────────────────┘
```

### Table Definitions

#### `users`

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | bigint | PK, auto-increment | — | Primary key |
| `name` | varchar(255) | NOT NULL | — | Full name |
| `email` | varchar(255) | UNIQUE, NOT NULL | — | Email address |
| `email_verified_at` | timestamp | nullable | NULL | Email verification date |
| `password` | varchar(255) | NOT NULL | — | Bcrypt hashed password |
| `role` | varchar(255) | indexed, NOT NULL | `'applicant'` | User role |
| `remember_token` | varchar(100) | nullable | NULL | Remember me token |
| `two_factor_secret` | text | nullable | NULL | Encrypted TOTP secret |
| `two_factor_recovery_codes` | text | nullable | NULL | Encrypted recovery codes (JSON) |
| `two_factor_confirmed_at` | timestamp | nullable | NULL | 2FA confirmation timestamp |
| `created_at` | timestamp | NOT NULL | — | Created at |
| `updated_at` | timestamp | NOT NULL | — | Updated at |

#### `portfolios`

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | bigint | PK | — | Primary key |
| `user_id` | bigint | FK → users, CASCADE | — | Portfolio owner |
| `title` | varchar(255) | NOT NULL | — | Portfolio title |
| `status` | varchar(255) | indexed, NOT NULL | `'draft'` | Lifecycle status |
| `admin_notes` | text | nullable | NULL | Admin notes / feedback |
| `submitted_at` | timestamp | nullable | NULL | Submission timestamp |
| `created_at` | timestamp | NOT NULL | — | Created at |
| `updated_at` | timestamp | NOT NULL | — | Updated at |

**Indexes:** `status`, composite `(user_id, status)`

#### `document_categories`

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | bigint | PK | — | Primary key |
| `name` | varchar(255) | NOT NULL | — | Category name |
| `slug` | varchar(255) | UNIQUE | — | URL-friendly slug |
| `description` | text | nullable | NULL | Category description |
| `is_required` | boolean | NOT NULL | `false` | Required for submission |
| `sort_order` | unsigned int | NOT NULL | `0` | Display ordering |
| `created_at` | timestamp | NOT NULL | — | Created at |
| `updated_at` | timestamp | NOT NULL | — | Updated at |

#### `portfolio_documents`

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | bigint | PK | — | Primary key |
| `portfolio_id` | bigint | FK → portfolios, CASCADE | — | Parent portfolio |
| `document_category_id` | bigint | FK → document_categories, CASCADE | — | Document category |
| `file_name` | varchar(255) | NOT NULL | — | Original filename |
| `file_path` | varchar(255) | NOT NULL | — | Storage path |
| `file_size` | bigint unsigned | NOT NULL | — | File size in bytes |
| `mime_type` | varchar(255) | NOT NULL | — | MIME type |
| `notes` | text | nullable | NULL | Document notes |
| `created_at` | timestamp | NOT NULL | — | Created at |
| `updated_at` | timestamp | NOT NULL | — | Updated at |

**Indexes:** composite `(portfolio_id, document_category_id)`

#### `portfolio_assignments`

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | bigint | PK | — | Primary key |
| `portfolio_id` | bigint | FK → portfolios, CASCADE | — | Portfolio to evaluate |
| `evaluator_id` | bigint | FK → users, CASCADE | — | Assigned evaluator |
| `assigned_by` | bigint | FK → users, CASCADE | — | Admin who assigned |
| `status` | varchar(255) | NOT NULL | `'pending'` | Assignment status |
| `due_date` | date | nullable | NULL | Evaluation due date |
| `notes` | text | nullable | NULL | Assignment notes |
| `assigned_at` | timestamp | NOT NULL | CURRENT | Assignment timestamp |
| `completed_at` | timestamp | nullable | NULL | Completion timestamp |
| `created_at` | timestamp | NOT NULL | — | Created at |
| `updated_at` | timestamp | NOT NULL | — | Updated at |

**Unique Constraint:** `(portfolio_id, evaluator_id)` — one assignment per evaluator per portfolio

#### `rubric_criterias`

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | bigint | PK | — | Primary key |
| `name` | varchar(255) | NOT NULL | — | Criteria name |
| `description` | text | nullable | NULL | Criteria description |
| `max_score` | integer | NOT NULL | `10` | Maximum score |
| `sort_order` | integer | NOT NULL | `0` | Display ordering |
| `is_active` | boolean | NOT NULL | `true` | Active status |
| `created_at` | timestamp | NOT NULL | — | Created at |
| `updated_at` | timestamp | NOT NULL | — | Updated at |

#### `evaluations`

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | bigint | PK | — | Primary key |
| `portfolio_id` | bigint | FK → portfolios, CASCADE | — | Evaluated portfolio |
| `evaluator_id` | bigint | FK → users, CASCADE | — | Evaluator user |
| `assignment_id` | bigint | FK → portfolio_assignments, SET NULL | NULL | Related assignment |
| `status` | varchar(255) | NOT NULL | `'draft'` | Evaluation status |
| `overall_comments` | text | nullable | NULL | Overall feedback |
| `recommendation` | text | nullable | NULL | approve / revise / reject |
| `total_score` | decimal(8,2) | nullable | NULL | Calculated total score |
| `max_possible_score` | decimal(8,2) | nullable | NULL | Maximum possible score |
| `submitted_at` | timestamp | nullable | NULL | Submission timestamp |
| `created_at` | timestamp | NOT NULL | — | Created at |
| `updated_at` | timestamp | NOT NULL | — | Updated at |

**Unique Constraint:** `(portfolio_id, evaluator_id)` — one evaluation per evaluator per portfolio

#### `evaluation_scores`

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | bigint | PK | — | Primary key |
| `evaluation_id` | bigint | FK → evaluations, CASCADE | — | Parent evaluation |
| `rubric_criteria_id` | bigint | FK → rubric_criterias, CASCADE | — | Rubric criteria |
| `score` | integer | NOT NULL | `0` | Score (0 to max_score) |
| `comments` | text | nullable | NULL | Criterion-specific comments |
| `created_at` | timestamp | NOT NULL | — | Created at |
| `updated_at` | timestamp | NOT NULL | — | Updated at |

**Unique Constraint:** `(evaluation_id, rubric_criteria_id)` — one score per criterion per evaluation

#### `notifications`

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | uuid | PK | — | UUID primary key |
| `type` | varchar(255) | NOT NULL | — | Notification class FQCN |
| `notifiable_type` | varchar(255) | NOT NULL | — | Polymorphic model type |
| `notifiable_id` | bigint | NOT NULL | — | Polymorphic model ID |
| `data` | text | NOT NULL | — | JSON payload |
| `read_at` | timestamp | nullable | NULL | Read timestamp |
| `created_at` | timestamp | NOT NULL | — | Created at |
| `updated_at` | timestamp | NOT NULL | — | Updated at |

#### Framework Tables

| Table | Purpose |
|-------|---------|
| `sessions` | Session storage (user_id, ip_address, user_agent, payload, last_activity) |
| `password_reset_tokens` | Password reset tokens keyed by email |
| `cache` / `cache_locks` | Application cache and atomic locks |
| `jobs` / `job_batches` / `failed_jobs` | Queue job management |

### Seeded Data

**Default Users** (password: `password`):

| Email | Role |
|-------|------|
| `admin@adfc.edu.ph` | Admin |
| `evaluator@adfc.edu.ph` | Evaluator |
| `applicant@adfc.edu.ph` | Applicant |

**Document Categories** (11 total):

| # | Name | Required |
|---|------|----------|
| 1 | CV / Resume | Yes |
| 2 | Diploma / Degree | Yes |
| 3 | Transcript of Records (TOR) | Yes |
| 4 | Professional Certifications | No |
| 5 | Employment Records / COE | Yes |
| 6 | Training Certificates | No |
| 7 | Work Samples / Portfolio Evidence | Yes |
| 8 | Character References | No |
| 9 | PSA Birth Certificate | Yes |
| 10 | 2x2 ID Photos | Yes |
| 11 | Statement of Purpose | Yes |

**Rubric Criteria** (6 criteria, 100 points total):

| # | Criteria | Max Score |
|---|----------|-----------|
| 1 | Completeness of Documentation | 20 |
| 2 | Relevance of Work Experience | 25 |
| 3 | Quality of Work Samples | 20 |
| 4 | Professional Growth & Development | 15 |
| 5 | Statement of Purpose | 10 |
| 6 | Character References | 10 |

---

## 4. API Routes

All routes are server-rendered via Inertia — there is no separate REST API. Routes return Inertia responses (`Inertia::render()`) or redirects.

### Public Routes

| Method | URI | Name | Description |
|--------|-----|------|-------------|
| `GET` | `/` | `home` | Welcome / landing page |

### Authentication Routes (Laravel Fortify)

| Method | URI | Name | Description |
|--------|-----|------|-------------|
| `GET` | `/login` | `login` | Login page |
| `POST` | `/login` | — | Authenticate user |
| `POST` | `/logout` | `logout` | Log out |
| `GET` | `/register` | `register` | Registration page |
| `POST` | `/register` | — | Create account |
| `GET` | `/forgot-password` | `password.request` | Forgot password form |
| `POST` | `/forgot-password` | `password.email` | Send reset link |
| `GET` | `/reset-password/{token}` | `password.reset` | Reset password form |
| `POST` | `/reset-password` | `password.update` | Update password |
| `GET` | `/verify-email` | `verification.notice` | Email verification notice |
| `GET` | `/verify-email/{id}/{hash}` | `verification.verify` | Verify email |
| `POST` | `/verify-email/resend` | `verification.send` | Resend verification email |
| `GET` | `/confirm-password` | `password.confirm` | Confirm password form |
| `POST` | `/confirm-password` | — | Confirm password |
| `GET` | `/two-factor-challenge` | `two-factor.login` | 2FA challenge page |

### Dashboard Route

| Method | URI | Name | Middleware | Description |
|--------|-----|------|-----------|-------------|
| `GET` | `/dashboard` | `dashboard` | `auth, verified` | Redirects to role-specific dashboard |

### Applicant Routes

**Prefix:** `/applicant` · **Middleware:** `auth, verified, role:applicant` · **Name Prefix:** `applicant.`

| Method | URI | Name | Controller | Action |
|--------|-----|------|-----------|--------|
| `GET` | `/dashboard` | `dashboard` | `DashboardController` | `__invoke` |
| `GET` | `/portfolios` | `portfolios.index` | `PortfolioController` | `index` |
| `GET` | `/portfolios/create` | `portfolios.create` | `PortfolioController` | `create` |
| `POST` | `/portfolios` | `portfolios.store` | `PortfolioController` | `store` |
| `GET` | `/portfolios/{portfolio}` | `portfolios.show` | `PortfolioController` | `show` |
| `DELETE` | `/portfolios/{portfolio}` | `portfolios.destroy` | `PortfolioController` | `destroy` |
| `POST` | `/portfolios/{portfolio}/submit` | `portfolios.submit` | `PortfolioController` | `submit` |
| `POST` | `/portfolios/{portfolio}/documents` | `portfolios.documents.store` | `PortfolioDocumentController` | `store` |
| `DELETE` | `/portfolios/{portfolio}/documents/{document}` | `portfolios.documents.destroy` | `PortfolioDocumentController` | `destroy` |
| `GET` | `/portfolios/{portfolio}/documents/{document}/download` | `portfolios.documents.download` | `PortfolioDocumentController` | `download` |

### Admin Routes

**Prefix:** `/admin` · **Middleware:** `auth, verified, role:admin` · **Name Prefix:** `admin.`

| Method | URI | Name | Controller | Action |
|--------|-----|------|-----------|--------|
| `GET` | `/dashboard` | `dashboard` | `DashboardController` | `__invoke` |
| `GET` | `/users` | `users.index` | `UserController` | `index` |
| `GET` | `/users/create` | `users.create` | `UserController` | `create` |
| `POST` | `/users` | `users.store` | `UserController` | `store` |
| `GET` | `/users/{user}/edit` | `users.edit` | `UserController` | `edit` |
| `PUT` | `/users/{user}` | `users.update` | `UserController` | `update` |
| `DELETE` | `/users/{user}` | `users.destroy` | `UserController` | `destroy` |
| `GET` | `/portfolios` | `portfolios.index` | `PortfolioController` | `index` |
| `GET` | `/portfolios/{portfolio}` | `portfolios.show` | `PortfolioController` | `show` |
| `POST` | `/portfolios/{portfolio}/assign` | `portfolios.assign` | `PortfolioController` | `assign` |
| `PUT` | `/portfolios/{portfolio}/status` | `portfolios.status` | `PortfolioController` | `updateStatus` |
| `DELETE` | `/portfolios/{portfolio}/assignments/{assignment}` | `portfolios.assignments.destroy` | `PortfolioController` | `removeAssignment` |
| `GET` | `/rubrics` | `rubrics.index` | `RubricCriteriaController` | `index` |
| `GET` | `/rubrics/create` | `rubrics.create` | `RubricCriteriaController` | `create` |
| `POST` | `/rubrics` | `rubrics.store` | `RubricCriteriaController` | `store` |
| `GET` | `/rubrics/{rubric}/edit` | `rubrics.edit` | `RubricCriteriaController` | `edit` |
| `PUT` | `/rubrics/{rubric}` | `rubrics.update` | `RubricCriteriaController` | `update` |
| `DELETE` | `/rubrics/{rubric}` | `rubrics.destroy` | `RubricCriteriaController` | `destroy` |
| `POST` | `/rubrics/{rubric}/toggle-active` | `rubrics.toggle-active` | `RubricCriteriaController` | `toggleActive` |
| `GET` | `/document-categories` | `document-categories.index` | `DocumentCategoryController` | `index` |
| `GET` | `/document-categories/create` | `document-categories.create` | `DocumentCategoryController` | `create` |
| `POST` | `/document-categories` | `document-categories.store` | `DocumentCategoryController` | `store` |
| `GET` | `/document-categories/{category}/edit` | `document-categories.edit` | `DocumentCategoryController` | `edit` |
| `PUT` | `/document-categories/{category}` | `document-categories.update` | `DocumentCategoryController` | `update` |
| `DELETE` | `/document-categories/{category}` | `document-categories.destroy` | `DocumentCategoryController` | `destroy` |
| `GET` | `/reports` | `reports` | `ReportController` | `__invoke` |

### Evaluator Routes

**Prefix:** `/evaluator` · **Middleware:** `auth, verified, role:evaluator` · **Name Prefix:** `evaluator.`

| Method | URI | Name | Controller | Action |
|--------|-----|------|-----------|--------|
| `GET` | `/dashboard` | `dashboard` | `DashboardController` | `__invoke` |
| `GET` | `/portfolios` | `portfolios.index` | `PortfolioController` | `index` |
| `GET` | `/portfolios/{assignment}` | `portfolios.show` | `PortfolioController` | `show` |
| `POST` | `/portfolios/{assignment}/save` | `portfolios.save` | `PortfolioController` | `saveEvaluation` |
| `POST` | `/portfolios/{assignment}/submit` | `portfolios.submit` | `PortfolioController` | `submitEvaluation` |

### Notification Routes

**Prefix:** `/notifications` · **Middleware:** `auth, verified`

| Method | URI | Name | Controller | Action |
|--------|-----|------|-----------|--------|
| `GET` | `/` | `notifications.index` | `NotificationController` | `index` |
| `PATCH` | `/{id}/read` | `notifications.read` | `NotificationController` | `markAsRead` |
| `POST` | `/mark-all-read` | `notifications.mark-all-read` | `NotificationController` | `markAllAsRead` |

### Settings Routes

**Prefix:** `/settings` · **Middleware:** `auth` (or `auth, verified`)

| Method | URI | Name | Middleware | Controller | Action |
|--------|-----|------|-----------|-----------|--------|
| `GET` | `/profile` | `profile.edit` | `auth` | `ProfileController` | `edit` |
| `PATCH` | `/profile` | `profile.update` | `auth` | `ProfileController` | `update` |
| `DELETE` | `/profile` | `profile.destroy` | `auth, verified` | `ProfileController` | `destroy` |
| `GET` | `/password` | `user-password.edit` | `auth, verified` | `PasswordController` | `edit` |
| `PUT` | `/password` | `user-password.update` | `auth, verified, throttle:6,1` | `PasswordController` | `update` |
| `GET` | `/appearance` | `appearance.edit` | `auth, verified` | Inertia render | — |
| `GET` | `/two-factor` | `two-factor.show` | `auth, verified` | `TwoFactorAuthController` | `show` |

### Document Download Route

| Method | URI | Name | Middleware | Controller |
|--------|-----|------|-----------|-----------|
| `GET` | `/documents/{document}/download` | `documents.download` | `auth, verified` | `DocumentDownloadController` |

**Access:** Portfolio owner, admins, or assigned evaluators. Supports `?preview=true` for inline display.

---

## 5. Authentication & Authorization

### Authentication (Laravel Fortify)

Fortify provides headless authentication with Inertia views:

| Feature | Status | Details |
|---------|--------|---------|
| **Registration** | Enabled | New users default to `applicant` role |
| **Login** | Enabled | Email + password, rate limited (5/min) |
| **Password Reset** | Enabled | Token-based email reset flow |
| **Email Verification** | Enabled | Required before accessing protected routes |
| **Two-Factor Auth** | Enabled | TOTP with confirmation + recovery codes |
| **Password Confirmation** | Enabled | Required for sensitive actions (3-hour timeout) |

**Rate Limiting:**
- Login: 5 attempts per minute per email + IP
- Two-factor challenge: 5 attempts per minute per session
- Password update: 6 attempts per minute

**Password Requirements** (production):
- Minimum 12 characters
- Mixed case letters
- At least one number
- At least one symbol
- Checked against compromised password databases

### Authorization

#### Role-Based Middleware

The `EnsureUserHasRole` middleware (aliased as `role`) validates user roles:

```php
// Route definition
Route::middleware('role:admin')->group(function () { ... });
Route::middleware('role:admin,evaluator')->group(function () { ... });
```

The middleware accepts one or more roles and returns `403 Forbidden` if the user's role doesn't match.

#### Authorization Gates

Defined in `AppServiceProvider`:

| Gate | Allowed Role | Description |
|------|-------------|-------------|
| `manage-users` | Admin | Create, edit, delete users |
| `manage-portfolios` | Admin | View all portfolios, assign evaluators, change status |
| `evaluate-portfolios` | Evaluator | Score assigned portfolios |
| `submit-portfolios` | Applicant | Create, edit, submit portfolios |
| `manage-rubrics` | Admin | CRUD rubric criteria |

#### Form Request Authorization

All form requests implement `authorize()` checks:

- **Admin requests:** Verify `can('manage-users')` or `isAdministrative()`
- **Applicant requests:** Verify `can('submit-portfolios')` + portfolio ownership + editability
- **Evaluator requests:** Verify assignment ownership in controller methods

### Roles & Enums

#### `UserRole`

| Case | Value | Label |
|------|-------|-------|
| `Admin` | `admin` | Admin |
| `Evaluator` | `evaluator` | Evaluator |
| `Applicant` | `applicant` | Applicant |

#### `PortfolioStatus`

| Case | Value | Color | Label |
|------|-------|-------|-------|
| `Draft` | `draft` | secondary | Draft |
| `Submitted` | `submitted` | default | Submitted |
| `UnderReview` | `under_review` | warning | Under Review |
| `Evaluated` | `evaluated` | info | Evaluated |
| `RevisionRequested` | `revision_requested` | destructive | Revision Requested |
| `Approved` | `approved` | success | Approved |
| `Rejected` | `rejected` | destructive | Rejected |

#### `EvaluationStatus`

| Case | Value | Label |
|------|-------|-------|
| `Draft` | `draft` | Draft |
| `Submitted` | `submitted` | Submitted |

#### `AssignmentStatus`

| Case | Value | Color | Label |
|------|-------|-------|-------|
| `Pending` | `pending` | secondary | Pending |
| `InProgress` | `in_progress` | warning | In Progress |
| `Completed` | `completed` | success | Completed |

---

## 6. Key Models & Relationships

### Relationship Map

```
User
├── portfolios()              → HasMany → Portfolio
└── evaluatorAssignments()    → HasMany → PortfolioAssignment (via evaluator_id)

Portfolio
├── user()                    → BelongsTo → User
├── documents()               → HasMany → PortfolioDocument
├── assignments()             → HasMany → PortfolioAssignment
└── evaluations()             → HasMany → Evaluation

PortfolioDocument
├── portfolio()               → BelongsTo → Portfolio
└── category()                → BelongsTo → DocumentCategory

DocumentCategory
└── documents()               → HasMany → PortfolioDocument

PortfolioAssignment
├── portfolio()               → BelongsTo → Portfolio
├── evaluator()               → BelongsTo → User (evaluator_id)
├── assigner()                → BelongsTo → User (assigned_by)
└── evaluation()              → HasOne → Evaluation (assignment_id)

Evaluation
├── portfolio()               → BelongsTo → Portfolio
├── evaluator()               → BelongsTo → User (evaluator_id)
├── assignment()              → BelongsTo → PortfolioAssignment
└── scores()                  → HasMany → EvaluationScore

EvaluationScore
├── evaluation()              → BelongsTo → Evaluation
└── criteria()                → BelongsTo → RubricCriteria

RubricCriteria
└── scores()                  → HasMany → EvaluationScore
```

### Model Details

#### User

- **Casts:** `role` → `UserRole` enum, `password` → hashed, `email_verified_at` → datetime
- **Hidden:** `password`, `two_factor_secret`, `two_factor_recovery_codes`, `remember_token`
- **Traits:** `TwoFactorAuthenticatable` (Fortify), `MustVerifyEmail`
- **Helpers:** `isAdmin()`, `isEvaluator()`, `isApplicant()`, `hasRole(...$roles)`, `isAdministrative()`

#### Portfolio

- **Casts:** `status` → `PortfolioStatus` enum, `submitted_at` → datetime
- **Helpers:**
  - `isDraft()` — status is Draft
  - `isSubmitted()` — status is Submitted
  - `canBeEdited()` — Draft or RevisionRequested
  - `canBeSubmitted()` — Draft or RevisionRequested
  - `canBeDeleted()` — Draft only
  - `latestAssignment()` — most recent assignment by `assigned_at`

#### Evaluation

- **Casts:** `status` → `EvaluationStatus` enum, `total_score` / `max_possible_score` → `decimal:2`
- **Key Method:** `calculateTotalScore()` — aggregates individual `EvaluationScore` sums and computes `max_possible_score` from active `RubricCriteria`

#### RubricCriteria

- **Custom Table:** `rubric_criterias`
- **Scopes:** `active()` (where is_active = true), `ordered()` (order by sort_order ASC)

---

## 7. Notification System

All notifications use the `database` channel only (no email delivery). Notifications are stored in the `notifications` table and accessed via the in-app notification center.

### Notification Classes

#### PortfolioSubmittedNotification

| Property | Value |
|----------|-------|
| **Trigger** | Applicant submits a portfolio |
| **Recipients** | All admin users |
| **Channel** | `database` |

```json
{
    "type": "portfolio_submitted",
    "title": "New Portfolio Submitted",
    "message": "{user_name} submitted their portfolio \"{title}\" for review.",
    "portfolio_id": 1,
    "user_id": 3,
    "url": "/admin/portfolios/1"
}
```

#### EvaluatorAssignedNotification

| Property | Value |
|----------|-------|
| **Trigger** | Admin assigns an evaluator to a portfolio |
| **Recipients** | Assigned evaluator |
| **Channel** | `database` |

```json
{
    "type": "evaluator_assigned",
    "title": "New Portfolio Assignment",
    "message": "You have been assigned to evaluate the portfolio \"{title}\" by {applicant_name}.",
    "portfolio_id": 1,
    "assignment_id": 5,
    "url": "/evaluator/portfolios/5"
}
```

#### EvaluationCompletedNotification

| Property | Value |
|----------|-------|
| **Trigger** | Evaluator submits a completed evaluation |
| **Recipients** | Portfolio owner (applicant) + all admin users |
| **Channel** | `database` |

```json
{
    "type": "evaluation_completed",
    "title": "Evaluation Completed",
    "message": "{evaluator_name} has completed the evaluation of portfolio \"{title}\".",
    "portfolio_id": 1,
    "evaluation_id": 2,
    "url": "/applicant/portfolios/1"
}
```

#### PortfolioStatusChangedNotification

| Property | Value |
|----------|-------|
| **Trigger** | Admin changes portfolio status |
| **Recipients** | Portfolio owner (applicant) |
| **Channel** | `database` |

```json
{
    "type": "portfolio_status_changed",
    "title": "Portfolio Status Updated",
    "message": "Your portfolio \"{title}\" status has been updated to {status_label}.",
    "portfolio_id": 1,
    "old_status": "under_review",
    "new_status": "approved",
    "url": "/applicant/portfolios/1"
}
```

### Notification Access

| Method | URI | Description |
|--------|-----|-------------|
| `GET` | `/notifications` | Paginated list (20/page) with unread count |
| `PATCH` | `/notifications/{id}/read` | Mark single notification as read |
| `POST` | `/notifications/mark-all-read` | Mark all as read |

---

## 8. Testing

### Framework

- **Test Runner:** PHPUnit 11.x via `php artisan test`
- **Base Class:** `Tests\TestCase` extending `Illuminate\Foundation\Testing\TestCase`
- **Database:** SQLite in-memory with `RefreshDatabase` trait
- **Test Environment:** Cache (array), session (array), queue (sync), mail (array), bcrypt rounds (4)

### Test Summary

| Category | Files | Tests | Coverage Area |
|----------|-------|-------|---------------|
| **Admin** | 6 | 59 | Dashboard, users, portfolios, rubrics, categories, reports |
| **Applicant** | 4 | 34 | Dashboard, portfolios, documents, evaluation results |
| **Auth** | 8 | 29 | Login, registration, password reset, email verification, 2FA |
| **Evaluator** | 1 | 10 | Evaluation workflow, scoring, submission |
| **Settings** | 3 | 12 | Profile, password, two-factor settings |
| **Infrastructure** | 3 | 16 | Role middleware, notifications, document downloads |
| **Unit** | 1 | 1 | Basic assertion |
| **Total** | **22** | **~150** | — |

### Test Patterns

| Pattern | Usage |
|---------|-------|
| `RefreshDatabase` | Transaction-wrapped database per test |
| `actingAs($user)` | Authenticate as specific role |
| `Notification::fake()` | Assert notification dispatch |
| `Storage::fake('local')` | Mock file storage |
| `$response->assertInertia(...)` | Assert Inertia page + props |
| `assertDatabaseHas()` / `Missing()` | Verify database state |
| `withoutVite()` | Disable Vite during tests |
| Factory states | `->admin()`, `->evaluator()`, `->submitted()`, etc. |

### Running Tests

```bash
# Run all tests
php artisan test --compact

# Run a specific test file
php artisan test --compact tests/Feature/Admin/PortfolioManagementTest.php

# Filter by test name
php artisan test --compact --filter=testAdminCanAssignEvaluator
```

---

## 9. Development Setup

### Prerequisites

- PHP 8.4+
- Composer 2.x
- Node.js 20+ & npm
- MySQL 8.0+ (production) or SQLite (development)
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url> adfc-eteeap-portal
cd adfc-eteeap-portal

# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env
# DB_CONNECTION=sqlite     (for development)
# DB_CONNECTION=mysql      (for production)

# Run migrations and seed the database
php artisan migrate --seed

# Create the storage symlink
php artisan storage:link

# Build frontend assets
npm run build
```

### Development Server

```bash
# Option 1: Run all services together
composer run dev

# Option 2: Run individually
php artisan serve            # Laravel development server (port 8000)
npm run dev                  # Vite dev server with HMR

# Option 3: Using Laravel Sail (Docker)
./vendor/bin/sail up -d
./vendor/bin/sail npm run dev
```

### Key Configuration

| Environment Variable | Purpose | Default |
|---------------------|---------|---------|
| `APP_URL` | Application URL | `http://localhost` |
| `DB_CONNECTION` | Database driver | `sqlite` |
| `DB_DATABASE` | Database name/path | — |
| `FILESYSTEM_DISK` | File storage disk | `local` |
| `MAIL_MAILER` | Mail driver | `log` |
| `QUEUE_CONNECTION` | Queue driver | `sync` |
| `SESSION_DRIVER` | Session storage | `database` |

### Code Quality Commands

```bash
# Format PHP code (Laravel Pint)
vendor/bin/pint --dirty --format agent

# Format JavaScript/TypeScript (Prettier)
npm run format

# Lint JavaScript/TypeScript (ESLint)
npm run lint

# Type check TypeScript
npx tsc --noEmit

# Generate Wayfinder route types
# (automatic via Vite plugin during dev/build)

# Run all tests
php artisan test --compact
```

### SSR Configuration

Server-side rendering is enabled by default:

```php
// config/inertia.php
'ssr' => [
    'enabled' => true,
    'url' => 'http://127.0.0.1:13714',
],
```

The SSR server is started automatically by Vite in development and requires a separate Node.js process in production.

---

## 10. Production Deployment

### Build Process

```bash
# Install production dependencies
composer install --optimize-autoloader --no-dev
npm ci

# Build optimized frontend assets
npm run build

# Cache Laravel configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Run migrations
php artisan migrate --force
```

### Server Requirements

- PHP 8.4+ with extensions: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML
- MySQL 8.0+
- Nginx or Apache with URL rewriting
- Node.js 20+ (for SSR process)
- SSL certificate (HTTPS required for 2FA)
- Supervisor (for queue workers and SSR process)

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name eteeap-portal.adfc.edu.ph;
    root /var/www/adfc-eteeap-portal/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_level crit; }
    location = /robots.txt  { access_log off; log_level crit; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### Supervisor Configuration

```ini
; Queue Worker
[program:eteeap-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/adfc-eteeap-portal/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/adfc-eteeap-portal/storage/logs/worker.log
stopwaitsecs=3600

; SSR Server
[program:eteeap-ssr]
command=php /var/www/adfc-eteeap-portal/artisan inertia:start-ssr
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/www/adfc-eteeap-portal/storage/logs/ssr.log
```

### File Storage

Documents are stored on the `local` disk under `storage/app/private/portfolios/{portfolio_id}/`. Ensure:

- The `storage/app/private` directory is writable by the web server
- The `public/storage` symlink is created (`php artisan storage:link`)
- Uploaded files are NOT publicly accessible (served through controllers with authorization checks)

### Security Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] `APP_ENV=production`
- [ ] Strong `APP_KEY` generated
- [ ] HTTPS enforced (required for 2FA TOTP)
- [ ] Database credentials secured
- [ ] File upload limits configured in PHP (`upload_max_filesize`, `post_max_size`)
- [ ] Rate limiting active on login and 2FA routes
- [ ] CSRF protection enabled (default via Inertia)
- [ ] Session cookies set to secure, httpOnly, sameSite

---

## 11. Troubleshooting

### Common Issues

#### Vite Manifest Error

```
Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest
```

**Fix:** Run `npm run build` or start the dev server with `npm run dev`.

#### Storage Permission Errors

```
The "storage/app/private" directory is not writable.
```

**Fix:**

```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

#### SSR Errors

```
Inertia SSR server is not running.
```

**Fix:** Start the SSR server:

```bash
php artisan inertia:start-ssr
```

Or disable SSR in `config/inertia.php` by setting `ssr.enabled` to `false`.

#### Two-Factor Authentication Issues

- **QR code not displaying:** Ensure the `two_factor_secret` column exists in users table
- **Invalid TOTP code:** Check server time synchronization (NTP)
- **Recovery codes lost:** Admin can disable 2FA for the user or user can use recovery codes

#### File Upload Failures

- Check PHP `upload_max_filesize` ≥ 10M
- Check PHP `post_max_size` ≥ 12M
- Verify file type is allowed: PDF, DOC, DOCX, JPG, JPEG, PNG
- Ensure storage directory is writable

#### Database Migration Issues

```bash
# Reset and re-run all migrations (development only)
php artisan migrate:fresh --seed

# Check migration status
php artisan migrate:status
```

#### Role-Based Access Denied (403)

- Verify user has the correct `role` value in the database
- Check the route middleware matches the user's role
- Ensure email is verified (`email_verified_at` is not null)

### Logging

Logs are stored in `storage/logs/laravel.log`. To tail logs in real-time:

```bash
tail -f storage/logs/laravel.log

# Or using Laravel Pail (development)
php artisan pail
```

### Useful Artisan Commands

```bash
# Clear all caches
php artisan optimize:clear

# View registered routes
php artisan route:list

# Run database seeder
php artisan db:seed

# Fresh database with seeds (development only)
php artisan migrate:fresh --seed

# Interactive REPL
php artisan tinker

# List all registered Artisan commands
php artisan list
```
