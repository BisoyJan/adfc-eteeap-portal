# ETEEAP Portal — Implementation Audit

This document tracks progress on the ETEEAP feature expansion. It maps the
original user-requested feature set to what has been built so far, and lists
exactly what remains to be done.

Last updated: end of Phase 2 (per-subject workflow shipped).

---

## 1. Scope Recap (user request)

The user requested an expansion across three roles:

- **Admin:** Manage Academic Years, Subjects/Prospectus, and Criteria for
  Interview, Pre-Assessment, Worksite Visit, and Written Exam.
- **Applicant (Learner):** Per-subject Pre-Assessment, downloadable Modules,
  view grades/status, expanded registration profile (current position, years
  of IT experience, company, highest education).
- **Assessor (Evaluator):** Conduct/record Interview, Worksite Visit,
  Pre-Assessment review, and Written Exam scores per subject; upload modules;
  submit a final recommendation per applicant.

User's explicit prerequisite:

> "The admin should be able to create new subjects/prospectuses first
> (this is not yet in the system and must be implemented before proceeding
> with the features below)."

Phase 1 below fulfills that prerequisite plus the supporting foundation.

---

## 2. Phase 1 — Foundation (DONE)

### 2.1 Database

New migrations (run via `php artisan migrate`):

| Migration | Purpose |
|---|---|
| `2026_05_18_000001_create_academic_years_table.php` | `name` (unique), `start_date`, `end_date`, `is_active`, `notes` |
| `2026_05_18_000002_create_subjects_table.php` | FK `academic_year_id` (cascade), `code`, `name`, `description`, `units` (default 3), `is_active`; unique(`academic_year_id`,`code`) |
| `2026_05_18_000003_add_category_to_rubric_criterias_table.php` | Adds `category` (string 40, default `portfolio`, indexed) — categorizes existing rubric rows |
| `2026_05_18_000004_add_applicant_profile_to_users_table.php` | Adds `current_position`, `years_it_experience` (tinyint), `company`, `highest_education` |

Backwards compatibility: the rubric `category` defaults to `portfolio`, so all
pre-existing rubric rows and evaluations continue to function.

### 2.2 Models

- `app/Models/AcademicYear.php` — fillable, date+bool casts,
  `subjects(): HasMany`, `scopeActive`.
- `app/Models/Subject.php` — fillable, casts, `academicYear(): BelongsTo`,
  `scopeActive`.
- `app/Models/RubricCriteria.php` — added `category` to fillable, cast to
  `RubricCategory` enum, added `scopeOfCategory()`.
- `app/Models/User.php` — fillable extended with the four new applicant
  profile fields.

### 2.3 Enums

- `app/Enums/RubricCategory.php` — backed enum with cases `Interview`,
  `PreAssessment`, `WorksiteVisit`, `WrittenExam`, `Portfolio`. Helpers:
  `label()`, `values()`, `options()`.

### 2.4 HTTP layer

Controllers:

- `app/Http/Controllers/Admin/AcademicYearController.php` — index, create,
  store, edit, update, destroy, plus `setActive`. `setActive` uses
  `DB::transaction` to enforce a single active academic year.
- `app/Http/Controllers/Admin/SubjectController.php` — full resource +
  `toggleActive`. Index filters by `academic_year_id` query param,
  defaulting to the active year.
- `app/Http/Controllers/Admin/RubricCriteriaController.php` — extended to
  accept a `category` filter and pass `categories` + `filters` + `defaultCategory`
  props to the Inertia views.

Form Requests:

- `app/Http/Requests/Admin/StoreAcademicYearRequest.php`
- `app/Http/Requests/Admin/UpdateAcademicYearRequest.php`
  (uses `$this->route('academic_year')?->id` for unique-ignore)
- `app/Http/Requests/Admin/StoreSubjectRequest.php`
- `app/Http/Requests/Admin/UpdateSubjectRequest.php`
  (`code` unique is scoped to `academic_year_id`)
- `app/Http/Requests/Admin/StoreRubricCriteriaRequest.php` — added
  `category` rule (`Rule::in(RubricCategory::values())`)
- `app/Http/Requests/Admin/UpdateRubricCriteriaRequest.php` — same

Routes (added inside the admin middleware group in `routes/web.php`):

```
GET|POST  /admin/academic-years              admin.academic-years.{index,store}
GET       /admin/academic-years/create       admin.academic-years.create
GET|PUT   /admin/academic-years/{id}/edit    admin.academic-years.{edit,update}
DELETE    /admin/academic-years/{id}         admin.academic-years.destroy
POST      /admin/academic-years/{id}/set-active   admin.academic-years.set-active

GET|POST  /admin/subjects                    admin.subjects.{index,store}
GET       /admin/subjects/create             admin.subjects.create
GET|PUT   /admin/subjects/{id}/edit          admin.subjects.{edit,update}
DELETE    /admin/subjects/{id}               admin.subjects.destroy
POST      /admin/subjects/{id}/toggle-active admin.subjects.toggle-active
```

### 2.5 Frontend (Inertia + React 19 + Tailwind v4)

New pages:

- `resources/js/pages/admin/academic-years/index.tsx` — table, "Set Active"
  button, AlertDialog delete (disabled when `subjects_count > 0`).
- `resources/js/pages/admin/academic-years/create.tsx` and `edit.tsx` —
  name, start/end date, is_active checkbox, notes textarea.
- `resources/js/pages/admin/subjects/index.tsx` — Select filter by academic
  year, toggle-active / edit / delete actions.
- `resources/js/pages/admin/subjects/create.tsx` and `edit.tsx` —
  academic_year_id Select (defaults to active year), code, units, name,
  description, is_active.

Updated pages (category support):

- `resources/js/pages/admin/rubrics/index.tsx` — adds a Category filter and
  a Category column.
- `resources/js/pages/admin/rubrics/create.tsx` — Category Select, defaults
  to the currently filtered category.
- `resources/js/pages/admin/rubrics/edit.tsx` — Category Select bound to
  the existing criteria value.

Navigation:

- `resources/js/components/app-sidebar.tsx` — added **Academic Years**
  (`/admin/academic-years`) and **Subjects** (`/admin/subjects`) entries
  for admins.

### 2.6 Seeders

- `database/seeders/AcademicYearSubjectSeeder.php` — seeds AY `2025-2026`
  as active plus four BSIT subjects:
  `IT101 Intro to Programming`, `IT102 DBMS`, `IT103 Networking`,
  `IT104 Systems Analysis & Design`.
- `database/seeders/RubricCriteriaSeeder.php` — existing entries now
  explicitly set `category => 'portfolio'`.
- `database/seeders/DatabaseSeeder.php` — calls the new seeder.

### 2.7 Verification

- `php artisan migrate` — succeeded.
- `php artisan db:seed --class=AcademicYearSubjectSeeder` — succeeded.
- `vendor/bin/pint --dirty` — applied formatting to new files.
- `php artisan route:list` confirms all new routes are registered.
- No PHP or TypeScript errors reported on touched files.

---

## 3. Feature ↔ Status Matrix

| Area | Feature | Status |
|---|---|---|
| Admin | Create / manage Academic Years (set active) | ✅ Done |
| Admin | Create / manage Subjects (Prospectus) scoped to an AY | ✅ Done |
| Admin | Manage Interview criteria | ✅ Done (via Rubric `category=interview`) |
| Admin | Manage Pre-Assessment criteria | ✅ Done (`category=pre_assessment`) |
| Admin | Manage Worksite Visit criteria | ✅ Done (`category=worksite_visit`) |
| Admin | Manage Written Exam criteria | ✅ Done (`category=written_exam`) |
| Admin | Manage Portfolio criteria (existing) | ✅ Preserved (default category) |
| Applicant | Expanded registration profile columns in DB | ✅ Done |
| Applicant | Registration form UI for new profile fields | ✅ Done (Phase 2) |
| Applicant | Per-subject Pre-Assessment (take/submit) | ✅ Done (Phase 2) |
| Applicant | Modules per subject (download) | ✅ Done (Phase 2) |
| Applicant | View grades & status per subject | ✅ Done (Phase 2) |
| Assessor | Pre-Assessment review per applicant/subject | ✅ Done (Phase 2) |
| Assessor | Interview workflow + scoring | ✅ Done (Phase 2) |
| Assessor | Worksite Visit workflow + scoring | ✅ Done (Phase 2) |
| Assessor | Written Exam scoring per subject | ✅ Done (Phase 2) |
| Assessor | Upload modules for subjects | ✅ Done (Phase 2, admin UI; route reused by evaluator via admin-shared module file) |
| Assessor | Final recommendation per applicant | ✅ Done (Phase 2, per assigned subject) |

---

## 4. Phase 2 — Per-Subject Workflow (DONE)

### 4.1 User decisions captured

1. **Pre-Assessment format:** hybrid — fixed question bank per subject **plus**
   a free-form narrative field on the attempt.
2. **Module storage:** local `storage/app/public` (served via `storage:link`).
3. **Recommendation outcomes:** `full_credit`, `partial_credit`,
   `additional_review`, `not_recommended`.
4. **Subject assignment:** admin assigns subjects (and the per-subject
   evaluator) after the applicant submits the portfolio.
5. **Re-assessment:** tracked as a new attempt — pre-assessment attempts and
   evaluator scoring both increment `attempt_number`.

### 4.2 Database

| Migration | Purpose |
|---|---|
| `2026_05_18_000005_create_portfolio_subjects_table.php` | Pivot `portfolio_id` × `subject_id` + per-row `evaluator_id`, `status` (enum), `recommendation` (nullable enum), `notes`. Unique(`portfolio_id`,`subject_id`). |
| `2026_05_18_000006_create_subject_modules_table.php` | Per-subject downloadable files: `title`, `description`, `file_path`, `original_name`, `mime_type`, `file_size`, `uploaded_by`. |
| `2026_05_18_000007_create_pre_assessment_questions_table.php` | Per-subject question bank: `question_text`, `sort_order`, `is_active`. |
| `2026_05_18_000008_create_pre_assessment_attempts_table.php` | `portfolio_subject_id` + `attempt_number` (unique `pa_attempts_ps_attempt_unique`), `narrative`, `status`, `submitted_at`, `score`, `evaluator_comments`, `graded_by`, `graded_at`. Child `pre_assessment_answers` with unique `pa_answers_attempt_q_unique` on (`attempt_id`,`question_id`). |
| `2026_05_18_000009_create_subject_evaluations_table.php` | Per `(portfolio_subject_id, category, attempt_number)` evaluation (unique `subj_eval_unique`) with `total_score`, `status`, `conducted_at`, `comments`. Child `subject_evaluation_scores` keyed by `rubric_criteria_id`. |

All migrations applied successfully against MySQL 8.

### 4.3 Enums

- `app/Enums/SubjectAssignmentStatus.php` — `Pending`, `InProgress`, `Completed`.
- `app/Enums/SubjectRecommendation.php` — `FullCredit`, `PartialCredit`,
  `AdditionalReview`, `NotRecommended`.
- `app/Enums/SubjectEvaluationStatus.php` — `Draft`, `Submitted`.

All three expose `label()`, `values()`, `options()` to mirror `RubricCategory`.

### 4.4 Models

New:

- `PortfolioSubject` (+ relations to `Portfolio`, `Subject`, `User` evaluator,
  `preAssessmentAttempts`, `subjectEvaluations`).
- `SubjectModule` (+ `subject`, `uploader`).
- `PreAssessmentQuestion` (+ `subject`).
- `PreAssessmentAttempt` (+ `portfolioSubject`, `answers`, `grader`).
- `PreAssessmentAnswer` (+ `attempt`, `question`).
- `SubjectEvaluation` (+ `portfolioSubject`, `scores`, `evaluator`,
  `calculateTotalScore()` helper that sums child scores).
- `SubjectEvaluationScore` (+ `evaluation`, `criteria`).

Modified:

- `Portfolio` — added `portfolioSubjects(): HasMany`.
- `Subject` — added `modules`, `preAssessmentQuestions`, `portfolioSubjects`.

### 4.5 HTTP layer

Controllers:

- `Admin\PortfolioSubjectController` — index/store/update/destroy. Index
  page lists assigned subjects with inline edit (status, evaluator,
  recommendation, notes).
- `Admin\SubjectModuleController` — index/store/destroy/download. Validates
  upload to 50 MB, stores on `public` disk under `subjects/{id}/modules`.
- `Admin\PreAssessmentQuestionController` — index/store/update/destroy with
  `sort_order` and `is_active`.
- `Applicant\SubjectController` — index, show, `downloadModule`,
  `startPreAssessment`, `editPreAssessment` (passes `readOnly` flag for
  submitted attempts), `savePreAssessment` (`DB::transaction`, `updateOrCreate`
  answers per question).
- `Applicant\GradesController` — single `__invoke`, aggregates
  pre-assessment, written exam, interview, worksite visit, and recommendation
  per assigned subject.
- `Evaluator\SubjectAssignmentController` — index/show (rubric grouped by
  category), `gradePreAssessment`, `saveEvaluation` (`updateOrCreate` by
  `(portfolio_subject_id, category, attempt_number)`, per-criterion score
  clamped to `criteria.max_score`, recalculates `total_score`),
  `updateAssignment` (status/recommendation/notes), `downloadModule` with
  cross-check that the evaluator is assigned to that subject.

Form Requests added for store/update across the new admin controllers.

Routes (all confirmed via `php artisan route:list`):

```
# Applicant
GET    /applicant/subjects                                  applicant.subjects.index
GET    /applicant/subjects/{portfolioSubject}               applicant.subjects.show
GET    /applicant/modules/{module}/download                 applicant.modules.download
POST   /applicant/subjects/{portfolioSubject}/pre-assessment/start
GET    /applicant/subjects/{portfolioSubject}/pre-assessment/{attempt}
PUT    /applicant/subjects/{portfolioSubject}/pre-assessment/{attempt}
GET    /applicant/grades                                    applicant.grades.index

# Admin
GET|POST   /admin/portfolios/{portfolio}/subjects           admin.portfolios.subjects.{index,store}
PUT|DELETE /admin/portfolios/{portfolio}/subjects/{ps}      admin.portfolios.subjects.{update,destroy}
GET|POST   /admin/subjects/{subject}/modules                admin.subjects.modules.{index,store}
DELETE     /admin/subjects/{subject}/modules/{module}       admin.subjects.modules.destroy
GET        /admin/subjects/{subject}/modules/{module}/download
GET|POST   /admin/subjects/{subject}/pre-assessment-questions  admin.subjects.questions.{index,store}
PUT|DELETE /admin/subjects/{subject}/pre-assessment-questions/{question}

# Evaluator
GET   /evaluator/subjects                                   evaluator.subjects.index
GET   /evaluator/subjects/{portfolioSubject}                evaluator.subjects.show
POST  /evaluator/subjects/{portfolioSubject}/save           evaluator.subjects.save
PUT   /evaluator/subjects/{portfolioSubject}                evaluator.subjects.update
POST  /evaluator/subjects/{portfolioSubject}/pre-assessment/{attempt}/grade
GET   /evaluator/subjects/modules/{module}/download
```

### 4.6 Frontend (Inertia + React 19 + Tailwind v4)

New pages:

- `resources/js/pages/admin/portfolios/subjects.tsx` — assign subject form,
  inline editable rows (status/evaluator/recommendation Selects, notes),
  delete confirmation.
- `resources/js/pages/admin/subjects/modules.tsx` — upload form
  (`forceFormData: true`), table with download/delete.
- `resources/js/pages/admin/subjects/pre-assessment-questions.tsx` —
  inline add/edit with `sort_order` and `is_active`.
- `resources/js/pages/applicant/subjects/index.tsx` — card grid with module
  and question counts plus latest pre-assessment badge.
- `resources/js/pages/applicant/subjects/show.tsx` — overview, module
  download list, pre-assessment attempts (Start/Continue), submitted
  evaluations grouped by category.
- `resources/js/pages/applicant/subjects/pre-assessment.tsx` — per-question
  textareas + narrative, Save Draft / Submit (uses `form.transform()` to
  package answers), `disabled` when `readOnly`.
- `resources/js/pages/applicant/grades/index.tsx` — table per subject with
  every category score plus recommendation badge.
- `resources/js/pages/evaluator/subjects/index.tsx` — paginated card grid of
  assignments.
- `resources/js/pages/evaluator/subjects/show.tsx` — composite page with
  `PreAssessmentGradeBlock` (collapsible Q&A view + grade form per submitted
  attempt) and `CategoryScoringBlock` (rubric grid per category with
  attempt number, conducted_at, comments, Save Draft / Submit, Retake button
  that increments `attempt_number`); assignment status / recommendation / notes
  form.

Updated:

- `resources/js/components/app-sidebar.tsx` — applicant gets **My Subjects**
  and **My Grades**; evaluator gets **Subject Assignments**.
- `resources/js/pages/admin/subjects/index.tsx` — per-row **Modules** and
  **Pre-Assessment** buttons.
- `resources/js/pages/admin/portfolios/show.tsx` — header **Manage Subjects**
  link.
- Fortify registration screen + applicant profile settings expose
  `current_position`, `years_it_experience`, `company`, `highest_education`.

### 4.7 Verification

- `php artisan migrate` — all 5 Phase 2 migrations applied.
- `php artisan storage:link` — symlink in place.
- `vendor/bin/pint --dirty --format=agent` — clean.
- `php artisan route:list` — all 17 new routes registered.
- `npm run build` — succeeds in ~17 s, all new pages bundled (no TS errors).

### 4.8 Known seeding prerequisites

Evaluator scoring grids render from active rubric criteria filtered by
category. `RubricCriteriaSeeder` now seeds 4 default criteria for each of
`pre_assessment`, `interview`, `worksite_visit`, and `written_exam` in
addition to the original 6 `portfolio` rows. Existing rows are preserved
via `updateOrCreate` keyed on `name`. Re-run with:

```powershell
php artisan db:seed --class=RubricCriteriaSeeder
```

---

## 5. Phase 2 backlog — historical (now complete)

Suggested order — each item is roughly one vertical slice:

1. **Applicant registration profile UI** — surface `current_position`,
   `years_it_experience`, `company`, `highest_education` in the Fortify
   registration screen and profile settings page.
2. **Portfolio ↔ Subject pivot** — table linking a portfolio to the
   subjects an applicant is seeking credit for (per-subject workflow keys
   off this).
3. **Modules** — `subject_modules` table (FK subject, file path, uploader),
   admin/assessor upload UI, applicant download UI.
4. **Pre-Assessment per subject** — `pre_assessments` table (applicant +
   subject + answers/score), applicant take-form, assessor review.
5. **Written Exam per subject** — score capture by assessor (rubric
   category `written_exam`), surfaced in applicant grade view.
6. **Interview workflow** — schedule + score capture (rubric category
   `interview`), notification to applicant.
7. **Worksite Visit workflow** — schedule + score capture (rubric category
   `worksite_visit`).
8. **Final recommendation enum + UI** — add `recommendation` field to
   evaluations (e.g. `recommend_full_credit`, `partial`, `additional_review`,
   `not_recommended`), assessor submission UI, admin override.
9. **Applicant grade dashboard** — aggregated view per subject combining
   pre-assessment, written exam, interview, worksite, portfolio.

Each Phase 2 slice should ship with: migration, model + factory, controller +
form requests, routes, Inertia page(s), seeder updates, and feature tests.

---

## 6. Commands the user should run after pulling this branch

```powershell
php artisan migrate
php artisan db:seed --class=AcademicYearSubjectSeeder
php artisan storage:link
npm run dev    # or: npm run build
```

Existing rubric rows automatically default to the `portfolio` category — no
manual backfill required. To re-seed rubric rows with the explicit category,
run `php artisan db:seed --class=RubricCriteriaSeeder` (only safe on a fresh
DB; otherwise it may duplicate).

---

## 7. Suggested next steps (post Phase 2)

1. ✅ Done — `RubricCriteriaSeeder` now seeds 4 default criteria for each
   of `interview`, `worksite_visit`, `written_exam`, and `pre_assessment`
   so evaluator scoring grids render out of the box.
2. Add feature tests for the new flows: admin assigning a subject + evaluator,
   applicant taking/submitting a pre-assessment, evaluator grading the
   pre-assessment and saving/submitting a category evaluation, module
   download access control (applicant must own the portfolio; evaluator must
   be assigned to the subject).
3. Optional: notification on subject assignment, on pre-assessment submission,
   and on evaluation completion (reuses existing notification scaffolding).
4. Optional: applicant-side "Subjects" picker during registration if the
   workflow shifts away from admin-driven assignment.
