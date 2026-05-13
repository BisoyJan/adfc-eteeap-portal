# ADFC ETEEAP Portal — Feature Audit

> Generated: May 13, 2026  
> Based on: `AdminAssessor KULANG SA SYSTEM.md` & `LEARNERS KULANG SA SYSTEM.md`

**Legend:** ✅ Implemented &nbsp;|&nbsp; ⚠️ Partial &nbsp;|&nbsp; ❌ Not Implemented

---

## 1. Admin / Assessor Features

### 1.1 Dashboard

| Feature | Status | Notes |
|---------|--------|-------|
| Learners with incomplete requirements | ⚠️ Partial | `pending_assignments` count is shown (portfolios with no evaluator), but there is no dedicated list of learners who haven't uploaded all required document categories |
| Active learners vs completed learners | ⚠️ Partial | Portfolios are grouped by status (Draft, Submitted, Under Review, Approved, etc.). No explicit "active learner" vs "completed learner" breakdown by person |

**Controller:** `Admin\DashboardController`  
**View:** `resources/js/pages/admin/dashboard.tsx`

---

### 1.2 Learner Management

| Feature | Status | Notes |
|---------|--------|-------|
| View list of all enrolled learners | ✅ Implemented | `Admin\UserController@index` — paginated user list |
| Filter learners by status (active, completed, inactive/deactivated) | ❌ Not Implemented | No `is_active` / `status` field on `User` model; no filter on the user list |
| Filter learners by assigned assessor | ❌ Not Implemented | User list (`/admin/users`) has no evaluator filter |
| View detailed learner profile | ❌ Not Implemented | `show` is excluded from the `users` resource route; no profile detail page for admins |

**Controller:** `Admin\UserController`  
**View:** `resources/js/pages/admin/users/`

---

### 1.3 Assessment and Evaluation

| Feature | Status | Notes |
|---------|--------|-------|
| List of learners assigned to me (assessor) | ✅ Implemented | `Evaluator\PortfolioController@index` — lists all assignments for the logged-in evaluator |
| Priority queue showing pending assessments | ⚠️ Partial | Pending assignments are surfaced on the evaluator dashboard, but there is no explicit "priority" ordering or queue UI |
| Access learner portfolio directly from assessment queue | ✅ Implemented | `Evaluator\PortfolioController@show` — full portfolio view with documents and evaluation form |
| Predefined competency framework | ✅ Implemented | `RubricCriteria` model + CRUD (`Admin\RubricCriteriaController`); criteria can be toggled active/inactive |

**Controller:** `Evaluator\PortfolioController`, `Admin\RubricCriteriaController`  
**View:** `resources/js/pages/evaluator/portfolios/`, `resources/js/pages/admin/rubrics/`

---

### 1.4 Progress Monitoring

| Feature | Status | Notes |
|---------|--------|-------|
| Competency completion status per learner | ⚠️ Partial | Required vs uploaded document category progress is calculated and passed to both admin and evaluator portfolio show views |
| Remaining requirements summary per learner | ⚠️ Partial | Count of required categories vs completed is available in the portfolio show pages; no dedicated summary list across all learners |
| Estimated time to completion calculator | ❌ Not Implemented | No deadline or velocity tracking exists |

---

### 1.5 Communication

| Feature | Status | Notes |
|---------|--------|-------|
| Inbox for receiving learner messages | ✅ Implemented | `MessageController@inbox` — paginated inbox with unread highlighting. Messages link added to sidebar for all roles with live unread badge. |
| Message notifications (email or in-app) | ✅ Implemented | `NewMessageNotification` fires via `database` + `mail` channels on every send/reply. Sidebar badge reflects `unreadMessagesCount()` shared globally via `HandleInertiaRequests`. |
| Send messages to individual learners | ✅ Implemented | `MessageController@store` — role-scoped recipient selection via `getAvailableRecipients()`. Admin can message all users; evaluators message assigned applicants + admins; applicants message assigned evaluators + admins. |
| Send bulk messages to multiple learners | ✅ Implemented | `MessageController@bulkStore` — admin-only bulk send to multiple recipients. |
| Message templates for common responses | ⚠️ Partial | 5 hardcoded templates in `create.tsx` frontend (Document Request, Evaluation Update, Welcome, Revision Required, Approval Notice). No `MessageTemplate` DB model/migration yet — templates are client-side only. |
| Sent messages folder | ✅ Implemented | `MessageController@sent` — paginated sent view. Now shows read receipt status per message (✅ Read / 🕐 Delivered) via `read_at` field. |
| Attach files to messages | ✅ Implemented | `MessageController@store` stores attachments via `MessageAttachment` model. `downloadAttachment()` streams files with auth check. |

**Controller:** `MessageController`  
**Notifications:** `NewMessageNotification`, `EvaluatorAssignedNotification`, `PortfolioStatusChangedNotification`, `PortfolioSubmittedNotification`, `EvaluationCompletedNotification`

---

### 1.6 System Administration

| Feature | Status | Notes |
|---------|--------|-------|
| Deactivate or suspend user accounts | ❌ Not Implemented | Only hard-delete exists (`UserController@destroy`). No `is_active`, `suspended_at`, or similar field on the `User` model |
| Permission settings per role | ⚠️ Partial | `UserRole` enum (Admin, Evaluator, Applicant) drives role-based middleware (`role:admin` etc.). No granular per-permission management UI |
| User activity log (login history, actions performed) | ❌ Not Implemented | No audit log, login history, or action tracking exists |

---

## 2. Learner Features

### 2.1 Dashboard

| Feature | Status | Notes |
|---------|--------|-------|
| Progress bar showing completed vs remaining requirements | ⚠️ Partial | Portfolio status counts (draft, submitted, under review, etc.) are sent to the dashboard. Document category progress is on the portfolio show page, not the main dashboard |
| Upcoming deadlines or requirements | ❌ Not Implemented | Assignments have a `due_date` column but it is not surfaced to the applicant dashboard |
| Announcements from ETEEAP program | ❌ Not Implemented | No announcements model, controller, or view exists |

**Controller:** `Applicant\DashboardController`  
**View:** `resources/js/pages/applicant/dashboard.tsx`

---

### 2.2 Communication Features

| Feature | Status | Notes |
|---------|--------|-------|
| Contact information of my assessor | ⚠️ Partial | Evaluator name is visible via the `assignments` relationship loaded on the applicant portfolio show page, but there is no dedicated contact card |
| Send message to my assessor | ✅ Implemented | `MessageController@store` — applicants can message their assigned evaluators and admins via `/messages/create`. Messages link in sidebar. |
| Send message to program coordinator | ✅ Implemented | Admins are always included in applicant and evaluator recipient lists via `getAvailableRecipients()`. |
| Inbox for receiving messages | ✅ Implemented | Full user-to-user inbox at `MessageController@inbox` with unread count badge in sidebar. |
| Sent messages folder | ✅ Implemented | `MessageController@sent` with read receipt indicators (Read / Delivered per message). |
| Message notifications (email or SMS) | ⚠️ Partial | Email notifications fire on each message/reply via `NewMessageNotification` (mail + database channels). No SMS. |
| Read receipts (know if message was seen) | ✅ Implemented | `read_at` is set when receiver opens a message (`show()`). Sent view shows ✅ Read or 🕐 Delivered per message. |

---

### 2.3 Report and Document Generation Features

| Feature | Status | Notes |
|---------|--------|-------|
| My complete portfolio summary | ⚠️ Partial | Portfolio show page (`applicant/portfolios/show`) renders all documents, progress, and evaluations on-screen. No downloadable/printable PDF report |
| My competency achievement report | ❌ Not Implemented | No exportable report |
| My assessment results summary | ⚠️ Partial | Submitted evaluation scores are shown in the portfolio show view. No downloadable report format |
| Course waiver recommendations report | ❌ Not Implemented | No waiver recommendation tracking or report |
| Progress-to-date report | ❌ Not Implemented | |

**Controller:** `Applicant\PortfolioController`  
**View:** `resources/js/pages/applicant/portfolios/show.tsx`

---

## Summary

| Role | Total Features | ✅ Implemented | ⚠️ Partial | ❌ Missing |
|------|---------------|----------------|------------|-----------|
| Admin / Assessor | 20 | 5 (25%) | 7 (35%) | 8 (40%) |
| Learner | 12 | 0 (0%) | 6 (50%) | 6 (50%) |
| **Combined** | **32** | **5 (16%)** | **13 (41%)** | **14 (43%)** |

---

## High-Priority Gaps

The following require attention (many backend models already exist but are missing frontend integration or specific sub-components):

1. **Messaging System** — ✅ DONE. Inbox, sent, compose, attachments, bulk send, read receipts, email notifications, sidebar badge, and DB-backed Message Templates all implemented.
2. **User Account Status** — (Backend Exists). Deactivate/suspend accounts (`is_active` flag on `User` exists). Needs frontend UI to toggle status.
3. **User Activity Log** — (Backend Exists). Models and controllers exist. Needs frontend audit trail view.
4. **Learner Profile (Admin View)** — Dedicated learner profile page for admins.
5. **Learner Filters** — Filter users by status and by assigned assessor in the UI.
6. **Announcements** — (Backend Exists). Need to surface announcements to Applicant and Assessor dashboards.
7. **Deadline Display** — Surface assignment `due_date` to applicant dashboard.
8. **Downloadable Reports** — ✅ DONE. CSV exports for portfolios, evaluator performance, competency criteria, and course waivers. Download buttons on admin Reports page. Print-to-PDF via browser print.
9. **Advanced ETA Calculator** — Completely missing logic to estimate complete time.

---

## 3. Detailed Implementation Plan for Missing & Partial Features

### 3.1 Communication & Messaging System — ✅ COMPLETED
**Completed (May 13, 2026):**
- `unreadMessageCount` shared globally via `HandleInertiaRequests` (backend)
- `auth.unreadMessageCount` added to `Auth` TypeScript type
- `badge?: number` added to `NavItem` type
- `NavMain` renders unread badge pill when `item.badge > 0`
- `Messages` nav link (with live badge) added to Admin, Evaluator, and Applicant sidebars (`app-sidebar.tsx`)
- `sent.tsx` — added `read_at` to message interface; shows ✅ Read / 🕐 Delivered per message
- Read receipts: `read_at` is set server-side in `MessageController@show` when receiver opens message
- **Message Templates (DB-backed):**
  - Migration: `2026_05_13_000002_create_message_templates_table.php` — `id`, `user_id` (FK), `title`, `subject`, `body`, `timestamps`
  - Model: `app/Models/MessageTemplate.php` — fillable, `user()` BelongsTo
  - Controller: `app/Http/Controllers/MessageTemplateController.php` — `index`, `store`, `update`, `destroy` (owner-only writes)
  - Routes: `GET/POST /message-templates`, `PUT/DELETE /message-templates/{messageTemplate}`
  - `MessageController@create` now queries and passes user's templates as `templates` prop
  - `pages/messages/create.tsx` — template Select uses DB templates; inline "Save as Template" form saves current subject+body

### 3.2 Report and Document Generation (Frontend Integration) — ✅ COMPLETED
**Completed (May 14, 2026):**
- `app/Http/Controllers/Admin/ReportExportController.php` — 4 CSV stream endpoints:
  - `portfolios()` — all portfolios with applicant, status, submitted date, assigned evaluators
  - `evaluators()` — per-evaluator: assigned/completed/pending counts + avg score %
  - `criteria()` — per-rubric criteria: avg score, percentage, evaluations count
  - `waivers()` — per-waiver row: course code/name, applicant, evaluator, status, notes
- Routes added to admin group: `GET admin/reports/export/{portfolios|evaluators|criteria|waivers}`
- `pages/admin/reports.tsx` — header export bar with 4 "Download CSV" buttons + Print button (replaces single Print button)

### 3.3 Dashboard Enhancements & Progress Monitoring
**Current State:** ✅ COMPLETED
**Implemented:**
- `Admin/DashboardController.php`: `learnersWithIncompleteRequirements` now returns `required_total` and `required_completed` fields. Added `upcomingAssignmentDeadlines` query — shows pending/in-progress assignments with `due_date` within 14 days (or already overdue), including evaluator name, applicant name, and `days_remaining`.
- `Applicant/DashboardController.php`: `recentPortfolios` now uses `with('documents.category')` and `withCount('documents')` so document progress and category `is_required` checks work correctly.
- `pages/admin/dashboard.tsx`: Added `upcomingAssignmentDeadlines` prop and rendered "Assignment Deadlines" card with overdue (red), approaching (amber), and normal rows. Incomplete Requirements section now shows a visual progress bar and `{completed}/{total}` count instead of badge.

### 3.4 Announcements System (Frontend Integration)
**Current State:** ✅ COMPLETED
**Implemented:**
- Backend already passes `announcements` (published, non-expired, role-filtered) to both `Applicant\DashboardController` and `Evaluator\DashboardController`.
- Both `pages/applicant/dashboard.tsx` and `pages/evaluator/dashboard.tsx` already render an Announcements card with title, body, and published date.
- Added "Announcements" nav link (with `Megaphone` icon) to the admin sidebar, pointing to `/admin/announcements` where the full CRUD management UI already exists (`index`, `create`, `edit` pages).

### 3.5 System Administration & User Management (Frontend Integration)
**Current State:** ✅ COMPLETED
**Implemented:**
- `UserController@index` — updated to accept `search`, `role`, `status`, `evaluator_id` filters; applies them to the query; passes `filters` and `evaluators` props (was causing the `Cannot read properties of undefined (reading 'search')` crash).
- `UserController@show` — added (route existed but method was missing); loads user with `portfolios.assignments.evaluator` and last 20 `activityLogs`; computes `portfolioStats` and `assignedEvaluators`.
- `UserController@activate` / `deactivate` — added (routes existed but methods were missing); guard prevents self-deactivation.
- `pages/admin/users/index.tsx` — already has full filter UI (search, role, status, assessor dropdown) and activate/deactivate toggle buttons.
- `pages/admin/users/show.tsx` — already complete: shows user info, portfolio stats, assigned evaluators, portfolio list, and activity log history.
- `pages/admin/activity-logs/index.tsx` — already complete: paginated table with search, action filter, and user filter.
- `ActivityLogController` — already complete: filters by user, action, search; paginates 25/page.
- `LogUserActivity` middleware — already registered in `bootstrap/app.php`; records login, logout, portfolio_submitted, portfolio_status_changed, evaluator_assigned, evaluation_submitted.
- Added "Activity Logs" nav link (`ScrollText` icon) to admin sidebar under Reports.

### 3.6 Advanced ETA Calculator ✅ COMPLETED
**Features:** Estimated time to completion calculator based on learner pace.
*   **Backend Logic (`app/Services/PaceCalculatorService.php`):**
    *   ✅ Created `PaceCalculatorService` — calculates `days_active`, `upload_velocity_per_week`, `estimated_days_remaining`, `estimated_completion_date`, `at_risk`, `confidence` based on portfolio document upload pace.
*   **Controllers:**
    *   ✅ `app/Http/Controllers/Admin/PortfolioController.php` — instantiates `PaceCalculatorService::calculate()` and passes `eta` prop to Inertia render.
*   **Frontend Components (`resources/js/`):**
    *   ✅ `pages/admin/portfolios/show.tsx` — renders "Completion Estimate" card in the right sidebar showing velocity, estimated date, deadline comparison (at-risk warning), and confidence badge.
