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
| Inbox for receiving learner messages | ❌ Not Implemented | No user-to-user messaging system exists |
| Message notifications (email or in-app) | ⚠️ Partial | In-app database notifications exist (`NotificationController`) for system events (portfolio submitted, evaluator assigned, status changed). No email-based messaging or SMS |
| Send messages to individual learners | ❌ Not Implemented | |
| Send bulk messages to multiple learners | ❌ Not Implemented | |
| Message templates for common responses | ❌ Not Implemented | |
| Sent messages folder | ❌ Not Implemented | |
| Attach files to messages | ❌ Not Implemented | |

**Controller:** `NotificationController`  
**Notifications:** `EvaluatorAssignedNotification`, `PortfolioStatusChangedNotification`, `PortfolioSubmittedNotification`, `EvaluationCompletedNotification`

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
| Send message to my assessor | ❌ Not Implemented | |
| Send message to program coordinator | ❌ Not Implemented | |
| Inbox for receiving messages | ⚠️ Partial | `NotificationController@index` provides a notifications list (paginated). These are system events, not user-to-user messages |
| Sent messages folder | ❌ Not Implemented | |
| Message notifications (email or SMS) | ⚠️ Partial | In-app notifications only (database driver). No email notifications for messages; no SMS at all |
| Read receipts (know if message was seen) | ❌ Not Implemented | |

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

The following are completely absent from the codebase and require new models, controllers, and views:

1. **Messaging System** — user-to-user messaging (inbox, sent, bulk send, file attachments, templates) — affects both Admin and Learner
2. **User Account Status** — deactivate/suspend accounts (`is_active` flag on `User`)
3. **User Activity Log** — login history and action audit trail
4. **Learner Profile (Admin View)** — dedicated learner profile page for admins
5. **Learner Filters** — filter users by status and by assigned assessor
6. **Announcements** — program-wide announcements from admin to learners
7. **Deadline Display** — surface assignment `due_date` to applicant dashboard
8. **Downloadable Reports** — PDF/Excel exports for portfolio summary, competency achievement, assessment results, course waiver, and progress-to-date
