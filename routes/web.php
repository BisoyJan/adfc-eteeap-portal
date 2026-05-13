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
    Route::resource('portfolios', \App\Http\Controllers\Applicant\PortfolioController::class)->except(['edit']);
    Route::post('portfolios/{portfolio}/submit', [\App\Http\Controllers\Applicant\PortfolioController::class, 'submit'])->name('portfolios.submit');
    Route::post('portfolios/{portfolio}/documents', [\App\Http\Controllers\Applicant\PortfolioDocumentController::class, 'store'])->name('portfolios.documents.store');
    Route::delete('portfolios/{portfolio}/documents/{document}', [\App\Http\Controllers\Applicant\PortfolioDocumentController::class, 'destroy'])->name('portfolios.documents.destroy');
    Route::get('portfolios/{portfolio}/documents/{document}/download', [\App\Http\Controllers\Applicant\PortfolioDocumentController::class, 'download'])->name('portfolios.documents.download');
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
    Route::resource('rubrics', \App\Http\Controllers\Admin\RubricCriteriaController::class)->except(['show']);
    Route::post('rubrics/{rubric}/toggle-active', [\App\Http\Controllers\Admin\RubricCriteriaController::class, 'toggleActive'])->name('rubrics.toggle-active');
    Route::resource('document-categories', \App\Http\Controllers\Admin\DocumentCategoryController::class)->except(['show']);
    Route::get('reports', \App\Http\Controllers\Admin\ReportController::class)->name('reports');
    Route::resource('announcements', \App\Http\Controllers\Admin\AnnouncementController::class)->except(['show']);
    Route::post('announcements/{announcement}/toggle-publish', [\App\Http\Controllers\Admin\AnnouncementController::class, 'togglePublish'])->name('announcements.toggle-publish');
    Route::get('activity-logs', \App\Http\Controllers\Admin\ActivityLogController::class)->name('activity-logs.index');
});

Route::middleware(['auth', 'verified', 'role:evaluator'])->prefix('evaluator')->name('evaluator.')->group(function () {
    Route::get('dashboard', \App\Http\Controllers\Evaluator\DashboardController::class)->name('dashboard');
    Route::get('portfolios', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'index'])->name('portfolios.index');
    Route::get('portfolios/{assignment}', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'show'])->name('portfolios.show');
    Route::post('portfolios/{assignment}/save', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'saveEvaluation'])->name('portfolios.save');
    Route::post('portfolios/{assignment}/submit', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'submitEvaluation'])->name('portfolios.submit');
    Route::post('portfolios/{assignment}/waivers', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'storeWaiver'])->name('portfolios.waivers.store');
    Route::delete('portfolios/{assignment}/waivers/{waiver}', [\App\Http\Controllers\Evaluator\PortfolioController::class, 'destroyWaiver'])->name('portfolios.waivers.destroy');
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

Route::get('documents/{document}/download', \App\Http\Controllers\DocumentDownloadController::class)
    ->middleware(['auth', 'verified'])
    ->name('documents.download');

require __DIR__.'/settings.php';
