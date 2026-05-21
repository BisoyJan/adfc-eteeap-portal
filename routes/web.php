<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    $user = auth()->user();

    if ($user->isAdministrative()) {
        return redirect()->route('admin.dashboard');
    }

    if ($user->isApplicant()) {
        return redirect()->route('applicant.dashboard');
    }

    if ($user->isEvaluator()) {
        return redirect()->route('evaluator.dashboard');
    }

    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified', 'role:applicant'])->prefix('applicant')->name('applicant.')->group(function () {
    Route::get('dashboard', \App\Http\Controllers\Applicant\DashboardController::class)->name('dashboard');
    Route::get('announcements', \App\Http\Controllers\Applicant\AnnouncementController::class)->name('announcements.index');
    Route::resource('portfolios', \App\Http\Controllers\Applicant\PortfolioController::class)->except(['edit']);
    Route::post('portfolios/{portfolio}/submit', [\App\Http\Controllers\Applicant\PortfolioController::class, 'submit'])->name('portfolios.submit');
    Route::post('portfolios/{portfolio}/documents', [\App\Http\Controllers\Applicant\PortfolioDocumentController::class, 'store'])->name('portfolios.documents.store');
    Route::delete('portfolios/{portfolio}/documents/{document}', [\App\Http\Controllers\Applicant\PortfolioDocumentController::class, 'destroy'])->name('portfolios.documents.destroy');
    Route::get('portfolios/{portfolio}/documents/{document}/download', [\App\Http\Controllers\Applicant\PortfolioDocumentController::class, 'download'])->name('portfolios.documents.download');

    // Subjects (per-applicant view)
    Route::get('subjects', [\App\Http\Controllers\Applicant\SubjectController::class, 'index'])->name('subjects.index');
    Route::get('subjects/{portfolioSubject}', [\App\Http\Controllers\Applicant\SubjectController::class, 'show'])->name('subjects.show');
    Route::post('subjects/{portfolioSubject}/modules', [\App\Http\Controllers\Applicant\SubjectController::class, 'uploadModule'])->name('subjects.modules.store');
    Route::get('modules/{module}/download', [\App\Http\Controllers\Applicant\SubjectController::class, 'downloadModule'])->name('modules.download');
    Route::post('subjects/{portfolioSubject}/pre-assessment/start', [\App\Http\Controllers\Applicant\SubjectController::class, 'startPreAssessment'])->name('subjects.pre-assessment.start');
    Route::get('subjects/{portfolioSubject}/pre-assessment/{attempt}', [\App\Http\Controllers\Applicant\SubjectController::class, 'editPreAssessment'])->name('subjects.pre-assessment.edit');
    Route::put('subjects/{portfolioSubject}/pre-assessment/{attempt}', [\App\Http\Controllers\Applicant\SubjectController::class, 'savePreAssessment'])->name('subjects.pre-assessment.save');

    // Grades
    Route::get('grades', \App\Http\Controllers\Applicant\GradesController::class)->name('grades.index');
});

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', \App\Http\Controllers\Admin\DashboardController::class)->name('dashboard');
    Route::resource('users', \App\Http\Controllers\Admin\UserController::class)->except(['show']);
    Route::get('users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'show'])->name('users.show');
    Route::post('users/{user}/deactivate', [\App\Http\Controllers\Admin\UserController::class, 'deactivate'])->name('users.deactivate');
    Route::post('users/{user}/activate', [\App\Http\Controllers\Admin\UserController::class, 'activate'])->name('users.activate');
    Route::get('portfolios', [\App\Http\Controllers\Admin\PortfolioController::class, 'index'])->name('portfolios.index');
    Route::get('portfolios/{portfolio}', [\App\Http\Controllers\Admin\PortfolioController::class, 'show'])->name('portfolios.show');
    Route::post('portfolios/{portfolio}/assign', [\App\Http\Controllers\Admin\PortfolioController::class, 'assign'])->name('portfolios.assign');
    Route::put('portfolios/{portfolio}/status', [\App\Http\Controllers\Admin\PortfolioController::class, 'updateStatus'])->name('portfolios.status');
    Route::delete('portfolios/{portfolio}/assignments/{assignment}', [\App\Http\Controllers\Admin\PortfolioController::class, 'removeAssignment'])->name('portfolios.assignments.destroy');
    Route::delete('portfolios/{portfolio}', [\App\Http\Controllers\Admin\PortfolioController::class, 'destroy'])->name('portfolios.destroy');
    Route::resource('rubrics', \App\Http\Controllers\Admin\RubricCriteriaController::class)->except(['show']);
    Route::post('rubrics/{rubric}/toggle-active', [\App\Http\Controllers\Admin\RubricCriteriaController::class, 'toggleActive'])->name('rubrics.toggle-active');
    Route::resource('academic-years', \App\Http\Controllers\Admin\AcademicYearController::class)->except(['show']);
    Route::post('academic-years/{academic_year}/set-active', [\App\Http\Controllers\Admin\AcademicYearController::class, 'setActive'])->name('academic-years.set-active');
    Route::resource('subjects', \App\Http\Controllers\Admin\SubjectController::class)->except(['show']);
    Route::post('subjects/{subject}/toggle-active', [\App\Http\Controllers\Admin\SubjectController::class, 'toggleActive'])->name('subjects.toggle-active');

    // Subject modules
    Route::get('subjects/{subject}/modules', [\App\Http\Controllers\Admin\SubjectModuleController::class, 'index'])->name('subjects.modules.index');
    Route::get('subjects/{subject}/modules/{module}/download', [\App\Http\Controllers\Admin\SubjectModuleController::class, 'download'])->name('subjects.modules.download');

    // Pre-assessment questions
    Route::get('subjects/{subject}/pre-assessment-questions', [\App\Http\Controllers\Admin\PreAssessmentQuestionController::class, 'index'])->name('subjects.questions.index');
    Route::post('subjects/{subject}/pre-assessment-questions', [\App\Http\Controllers\Admin\PreAssessmentQuestionController::class, 'store'])->name('subjects.questions.store');
    Route::put('subjects/{subject}/pre-assessment-questions/{question}', [\App\Http\Controllers\Admin\PreAssessmentQuestionController::class, 'update'])->name('subjects.questions.update');
    Route::delete('subjects/{subject}/pre-assessment-questions/{question}', [\App\Http\Controllers\Admin\PreAssessmentQuestionController::class, 'destroy'])->name('subjects.questions.destroy');

    // Portfolio subjects (assignment of subjects to a portfolio)
    Route::get('portfolios/{portfolio}/subjects', [\App\Http\Controllers\Admin\PortfolioSubjectController::class, 'index'])->name('portfolios.subjects.index');
    Route::resource('document-categories', \App\Http\Controllers\Admin\DocumentCategoryController::class)->except(['show']);
    Route::get('reports', \App\Http\Controllers\Admin\ReportController::class)->name('reports');
    Route::get('reports/export/portfolios', [\App\Http\Controllers\Admin\ReportExportController::class, 'portfolios'])->name('reports.export.portfolios');
    Route::get('reports/export/evaluators', [\App\Http\Controllers\Admin\ReportExportController::class, 'evaluators'])->name('reports.export.evaluators');
    Route::get('reports/export/criteria', [\App\Http\Controllers\Admin\ReportExportController::class, 'criteria'])->name('reports.export.criteria');
    Route::get('reports/export/waivers', [\App\Http\Controllers\Admin\ReportExportController::class, 'waivers'])->name('reports.export.waivers');
    Route::resource('announcements', \App\Http\Controllers\Admin\AnnouncementController::class)->except(['show']);
    Route::post('announcements/{announcement}/toggle-publish', [\App\Http\Controllers\Admin\AnnouncementController::class, 'togglePublish'])->name('announcements.toggle-publish');
    Route::get('activity-logs', \App\Http\Controllers\Admin\ActivityLogController::class)->name('activity-logs.index');
});

Route::middleware(['auth', 'verified', 'role:evaluator'])->prefix('evaluator')->name('evaluator.')->group(function () {
    Route::get('dashboard', \App\Http\Controllers\Evaluator\DashboardController::class)->name('dashboard');
    Route::get('announcements', \App\Http\Controllers\Evaluator\AnnouncementController::class)->name('announcements.index');
    Route::get('portfolios', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'index'])->name('portfolios.index');
    Route::get('portfolios/{assignment}', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'show'])->name('portfolios.show');
    Route::post('portfolios/{assignment}/save', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'saveEvaluation'])->name('portfolios.save');
    Route::post('portfolios/{assignment}/submit', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'submitEvaluation'])->name('portfolios.submit');
    Route::post('portfolios/{assignment}/subjects', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'storeSubject'])->name('portfolios.subjects.store');
    Route::delete('portfolios/{assignment}/subjects/{portfolioSubject}', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'destroySubject'])->name('portfolios.subjects.destroy');
    Route::post('portfolios/{assignment}/waivers', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'storeWaiver'])->name('portfolios.waivers.store');
    Route::delete('portfolios/{assignment}/waivers/{waiver}', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'destroyWaiver'])->name('portfolios.waivers.destroy');
    Route::get('portfolios/{assignment}/worksite', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'showWorksite'])->name('portfolios.worksite');
    Route::post('portfolios/{assignment}/worksite', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'saveWorksiteEvaluation'])->name('portfolios.worksite.save');
    Route::post('portfolios/{assignment}/worksite/submit', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'submitWorksiteEvaluation'])->name('portfolios.worksite.submit');

    // Per-subject assignments (written exam / pre-assessment grading)
    Route::get('subjects', [\App\Http\Controllers\Evaluator\SubjectAssignmentController::class, 'index'])->name('subjects.index');
    Route::post('subjects/enroll', [\App\Http\Controllers\Evaluator\SubjectAssignmentController::class, 'enrollApplicant'])->name('subjects.enroll');
    Route::get('subjects/{portfolioSubject}', [\App\Http\Controllers\Evaluator\SubjectAssignmentController::class, 'show'])->name('subjects.show');
    Route::post('subjects/{portfolioSubject}/save', [\App\Http\Controllers\Evaluator\SubjectAssignmentController::class, 'saveEvaluation'])->name('subjects.save');
    Route::post('subjects/{portfolioSubject}/portfolio-evaluation', [\App\Http\Controllers\Evaluator\SubjectAssignmentController::class, 'savePortfolioEvaluation'])->name('subjects.portfolio-evaluation.save');
    Route::put('subjects/{portfolioSubject}', [\App\Http\Controllers\Evaluator\SubjectAssignmentController::class, 'updateAssignment'])->name('subjects.update');
    Route::post('subjects/{portfolioSubject}/pre-assessment/{attempt}/grade', [\App\Http\Controllers\Evaluator\SubjectAssignmentController::class, 'gradePreAssessment'])->name('subjects.pre-assessment.grade');
    Route::post('subjects/{portfolioSubject}/modules', [\App\Http\Controllers\Evaluator\SubjectAssignmentController::class, 'uploadModule'])->name('subjects.modules.store');
    Route::get('subjects/modules/{module}/download', [\App\Http\Controllers\Evaluator\SubjectAssignmentController::class, 'downloadModule'])->name('subjects.modules.download');
});

Route::middleware(['auth', 'verified'])->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [\App\Http\Controllers\NotificationController::class, 'index'])->name('index');
    Route::patch('{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('read');
    Route::post('mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
});

Route::middleware(['auth', 'verified'])->prefix('messages')->name('messages.')->group(function () {
    Route::get('inbox', [\App\Http\Controllers\MessageController::class, 'inbox'])->name('inbox');
    Route::get('sent', [\App\Http\Controllers\MessageController::class, 'sent'])->name('sent');
    Route::get('create', [\App\Http\Controllers\MessageController::class, 'create'])->name('create');
    Route::post('/', [\App\Http\Controllers\MessageController::class, 'store'])->name('store');
    Route::post('bulk', [\App\Http\Controllers\MessageController::class, 'bulkStore'])->name('bulk');
    Route::get('{message}', [\App\Http\Controllers\MessageController::class, 'show'])->name('show');
    Route::post('{message}/reply', [\App\Http\Controllers\MessageController::class, 'reply'])->name('reply');
    Route::delete('{message}', [\App\Http\Controllers\MessageController::class, 'destroy'])->name('destroy');
    Route::get('attachments/{attachment}/download', [\App\Http\Controllers\MessageController::class, 'downloadAttachment'])->name('attachments.download');
});

Route::middleware(['auth', 'verified'])->prefix('message-templates')->name('message-templates.')->group(function () {
    Route::get('/', [\App\Http\Controllers\MessageTemplateController::class, 'index'])->name('index');
    Route::post('/', [\App\Http\Controllers\MessageTemplateController::class, 'store'])->name('store');
    Route::put('{messageTemplate}', [\App\Http\Controllers\MessageTemplateController::class, 'update'])->name('update');
    Route::delete('{messageTemplate}', [\App\Http\Controllers\MessageTemplateController::class, 'destroy'])->name('destroy');
});

Route::get('documents/{document}/download', \App\Http\Controllers\DocumentDownloadController::class)
    ->middleware(['auth', 'verified'])
    ->name('documents.download');

require __DIR__.'/settings.php';
