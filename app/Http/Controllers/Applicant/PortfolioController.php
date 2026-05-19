<?php

namespace App\Http\Controllers\Applicant;

use App\Enums\PortfolioStatus;
use App\Enums\RubricCategory;
use App\Enums\SubjectEvaluationStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Applicant\StorePortfolioRequest;
use App\Http\Requests\Applicant\SubmitPortfolioRequest;
use App\Http\Requests\Applicant\UpdatePortfolioRequest;
use App\Models\DocumentCategory;
use App\Models\Portfolio;
use App\Models\PortfolioSubject;
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
        $user = auth()->user();

        $portfolios = auth()->user()->portfolios()
            ->latest()
            ->paginate(10);

        $latestPortfolio = $user->portfolios()->latest('created_at')->first();
        $canCreatePortfolio = $latestPortfolio === null || $latestPortfolio->status === PortfolioStatus::Rejected;

        return Inertia::render('applicant/portfolios/index', [
            'portfolios' => $portfolios,
            'canCreatePortfolio' => $canCreatePortfolio,
            'createRestrictionMessage' => $canCreatePortfolio
                ? null
                : 'You already have an active application. You can reapply only after a rejected result.',
        ]);
    }

    public function create(): Response|RedirectResponse
    {
        $user = auth()->user();
        $latestPortfolio = $user->portfolios()->latest('created_at')->first();

        if ($latestPortfolio !== null && $latestPortfolio->status !== PortfolioStatus::Rejected) {
            return redirect()->route('applicant.portfolios.index')
                ->with('error', 'You can only create a new application after a rejected result.');
        }

        $categories = DocumentCategory::orderBy('sort_order')->get([
            'id',
            'name',
            'description',
            'is_required',
        ]);

        return Inertia::render('applicant/portfolios/create', [
            'categories' => $categories,
            'applicantInfo' => [
                'name' => $user->name,
                'current_position' => $user->current_position,
                'years_it_experience' => $user->years_it_experience,
                'company' => $user->company,
                'highest_education' => $user->highest_education,
            ],
        ]);
    }

    public function store(StorePortfolioRequest $request): RedirectResponse
    {
        $user = auth()->user();
        $latestPortfolio = $user->portfolios()->latest('created_at')->first();

        if ($latestPortfolio !== null && $latestPortfolio->status !== PortfolioStatus::Rejected) {
            return redirect()->route('applicant.portfolios.index')
                ->with('error', 'You can only create a new application after a rejected result.');
        }

        $portfolio = auth()->user()->portfolios()->create([
            'title' => 'Untitled Portfolio',
            'status' => PortfolioStatus::Draft,
        ]);

        return redirect()->route('applicant.portfolios.show', $portfolio)
            ->with('success', 'Application draft created. Upload all required documents before setting your portfolio title.');
    }

    public function show(Portfolio $portfolio): Response|RedirectResponse
    {
        if ($portfolio->user_id !== auth()->id()) {
            abort(403);
        }

        $portfolio->load(['documents.category', 'assignments.evaluator:id,name,email', 'waiverRecommendations.evaluator:id,name']);

        $categories = DocumentCategory::orderBy('sort_order')->get();

        $uploadedCategoryIds = $portfolio->documents
            ->pluck('document_category_id')
            ->unique()
            ->values();

        $requiredCount = $categories->where('is_required', true)->count();
        $completedRequiredCount = $categories->where('is_required', true)
            ->whereIn('id', $uploadedCategoryIds)
            ->count();

        $evaluations = $portfolio->evaluations()
            ->where('status', \App\Enums\EvaluationStatus::Submitted)
            ->with(['evaluator:id,name', 'scores.criteria'])
            ->get();

        $worksiteVisitRatings = $portfolio->portfolioSubjects()
            ->with([
                'subject:id,code,name',
                'subjectEvaluations' => fn ($q) => $q
                    ->where('status', SubjectEvaluationStatus::Submitted)
                    ->where('category', RubricCategory::WorksiteVisit)
                    ->with('evaluator:id,name')
                    ->orderByDesc('attempt_number'),
            ])
            ->get()
            ->map(function (PortfolioSubject $portfolioSubject) {
                $latest = $portfolioSubject->subjectEvaluations->first();

                if (! $latest) {
                    return null;
                }

                return [
                    'portfolio_subject_id' => $portfolioSubject->id,
                    'subject' => [
                        'code' => $portfolioSubject->subject->code,
                        'name' => $portfolioSubject->subject->name,
                    ],
                    'attempt_number' => $latest->attempt_number,
                    'score' => $latest->score,
                    'max_score' => $latest->max_score,
                    'conducted_at' => $latest->conducted_at,
                    'submitted_at' => $latest->submitted_at,
                    'comments' => $latest->comments,
                    'evaluator' => $latest->evaluator ? [
                        'id' => $latest->evaluator->id,
                        'name' => $latest->evaluator->name,
                    ] : null,
                ];
            })
            ->filter()
            ->values();

        $assignedSubjects = $portfolio->portfolioSubjects()
            ->with([
                'subject.academicYear:id,name',
                'evaluator:id,name,email',
            ])
            ->orderBy('assigned_at')
            ->get();

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
            'evaluations' => $evaluations,
            'worksiteVisitRatings' => $worksiteVisitRatings,
            'assignedSubjects' => $assignedSubjects,
            'waiverRecommendations' => $portfolio->waiverRecommendations,
        ]);
    }

    public function update(UpdatePortfolioRequest $request, Portfolio $portfolio): RedirectResponse
    {
        $requiredCategoryIds = DocumentCategory::query()
            ->where('is_required', true)
            ->pluck('id');

        if ($requiredCategoryIds->isNotEmpty()) {
            $uploadedRequiredCount = $portfolio->documents()
                ->whereIn('document_category_id', $requiredCategoryIds)
                ->distinct('document_category_id')
                ->count('document_category_id');

            if ($uploadedRequiredCount < $requiredCategoryIds->count()) {
                return back()
                    ->withErrors([
                        'title' => 'Upload all required documents before setting your portfolio title.',
                    ])
                    ->with('error', 'Upload all required documents before setting your portfolio title.');
            }
        }

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
        $admins = User::whereIn('role', [UserRole::Admin])->get();
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
