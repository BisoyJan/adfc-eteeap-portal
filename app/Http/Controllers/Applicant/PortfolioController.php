<?php

namespace App\Http\Controllers\Applicant;

use App\Enums\PortfolioStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Applicant\StorePortfolioRequest;
use App\Http\Requests\Applicant\SubmitPortfolioRequest;
use App\Http\Requests\Applicant\UpdatePortfolioRequest;
use App\Models\DocumentCategory;
use App\Models\Portfolio;
use App\Models\User;
use App\Notifications\PortfolioSubmittedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(): Response
    {
        $portfolios = auth()->user()->portfolios()
            ->latest()
            ->paginate(10);

        return Inertia::render('applicant/portfolios/index', [
            'portfolios' => $portfolios,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('applicant/portfolios/create');
    }

    public function store(StorePortfolioRequest $request): RedirectResponse
    {
        $portfolio = auth()->user()->portfolios()->create([
            'title' => $request->validated('title'),
            'status' => PortfolioStatus::Draft,
        ]);

        return redirect()->route('applicant.portfolios.show', $portfolio)
            ->with('success', 'Portfolio created successfully. Start uploading your documents.');
    }

    public function show(Portfolio $portfolio): Response|RedirectResponse
    {
        if ($portfolio->user_id !== auth()->id()) {
            abort(403);
        }

        $portfolio->load(['documents.category']);

        $categories = DocumentCategory::orderBy('sort_order')->get();

        $uploadedCategoryIds = $portfolio->documents
            ->pluck('document_category_id')
            ->unique()
            ->values();

        $requiredCount = $categories->where('is_required', true)->count();
        $completedRequiredCount = $categories->where('is_required', true)
            ->whereIn('id', $uploadedCategoryIds)
            ->count();

        return Inertia::render('applicant/portfolios/show', [
            'portfolio' => $portfolio,
            'categories' => $categories,
            'uploadedCategoryIds' => $uploadedCategoryIds,
            'progress' => [
                'required' => $requiredCount,
                'completed' => $completedRequiredCount,
                'percentage' => $requiredCount > 0
                    ? round(($completedRequiredCount / $requiredCount) * 100)
                    : 100,
            ],
        ]);
    }

    public function update(UpdatePortfolioRequest $request, Portfolio $portfolio): RedirectResponse
    {
        $portfolio->update([
            'title' => $request->validated('title'),
        ]);

        return back()->with('success', 'Portfolio updated successfully.');
    }

    public function submit(SubmitPortfolioRequest $request, Portfolio $portfolio): RedirectResponse
    {
        $portfolio->update([
            'status' => PortfolioStatus::Submitted,
            'submitted_at' => now(),
        ]);

        $portfolio->load('user');
        $admins = User::whereIn('role', [UserRole::Admin, UserRole::SuperAdmin])->get();
        Notification::send($admins, new PortfolioSubmittedNotification($portfolio));

        return redirect()->route('applicant.portfolios.index')
            ->with('success', 'Portfolio submitted successfully for review.');
    }

    public function destroy(Portfolio $portfolio): RedirectResponse
    {
        if ($portfolio->user_id !== auth()->id()) {
            abort(403);
        }

        if (! $portfolio->canBeDeleted()) {
            return back()->with('error', 'Only draft portfolios can be deleted.');
        }

        $portfolio->delete();

        return redirect()->route('applicant.portfolios.index')
            ->with('success', 'Portfolio deleted successfully.');
    }
}
