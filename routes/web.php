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
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified', 'role:applicant'])->prefix('applicant')->name('applicant.')->group(function () {
    Route::resource('portfolios', \App\Http\Controllers\Applicant\PortfolioController::class)->except(['edit']);
    Route::post('portfolios/{portfolio}/submit', [\App\Http\Controllers\Applicant\PortfolioController::class, 'submit'])->name('portfolios.submit');
    Route::post('portfolios/{portfolio}/documents', [\App\Http\Controllers\Applicant\PortfolioDocumentController::class, 'store'])->name('portfolios.documents.store');
    Route::delete('portfolios/{portfolio}/documents/{document}', [\App\Http\Controllers\Applicant\PortfolioDocumentController::class, 'destroy'])->name('portfolios.documents.destroy');
    Route::get('portfolios/{portfolio}/documents/{document}/download', [\App\Http\Controllers\Applicant\PortfolioDocumentController::class, 'download'])->name('portfolios.documents.download');
});

Route::middleware(['auth', 'verified', 'role:super_admin,admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', \App\Http\Controllers\Admin\UserController::class)->except(['show']);

    Route::get('dashboard', \App\Http\Controllers\Admin\DashboardController::class)->name('dashboard');

    Route::get('portfolios', [\App\Http\Controllers\Admin\PortfolioController::class, 'index'])->name('portfolios.index');
    Route::get('portfolios/{portfolio}', [\App\Http\Controllers\Admin\PortfolioController::class, 'show'])->name('portfolios.show');
    Route::post('portfolios/{portfolio}/assign', [\App\Http\Controllers\Admin\PortfolioController::class, 'assign'])->name('portfolios.assign');
    Route::put('portfolios/{portfolio}/status', [\App\Http\Controllers\Admin\PortfolioController::class, 'updateStatus'])->name('portfolios.status');
    Route::delete('portfolios/{portfolio}/assignments/{assignment}', [\App\Http\Controllers\Admin\PortfolioController::class, 'removeAssignment'])->name('portfolios.assignments.destroy');
});

require __DIR__.'/settings.php';
