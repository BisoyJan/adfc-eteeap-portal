<?php

namespace App\Http\Controllers\Evaluator;

use App\Enums\AssignmentStatus;
use App\Enums\EvaluationStatus;
use App\Enums\PortfolioStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\DocumentCategory;
use App\Models\Evaluation;
use App\Models\PortfolioAssignment;
use App\Models\RubricCriteria;
use App\Models\User;
use App\Notifications\EvaluationCompletedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(): Response
    {
        $assignments = PortfolioAssignment::query()
            ->where('evaluator_id', auth()->id())
            ->with(['portfolio.user', 'portfolio.documents'])
            ->latest('assigned_at')
            ->paginate(10);

        return Inertia::render('evaluator/portfolios/index', [
            'assignments' => $assignments,
        ]);
    }

    public function show(PortfolioAssignment $assignment): Response|RedirectResponse
    {
        if ($assignment->evaluator_id !== auth()->id()) {
            abort(403);
        }

        $assignment->load([
            'portfolio.user',
            'portfolio.documents.category',
            'assigner',
        ]);

        $categories = DocumentCategory::orderBy('sort_order')->get();

        $uploadedCategoryIds = $assignment->portfolio->documents
            ->pluck('document_category_id')
            ->unique()
            ->values();

        $requiredCount = $categories->where('is_required', true)->count();
        $completedRequiredCount = $categories->where('is_required', true)
            ->whereIn('id', $uploadedCategoryIds)
            ->count();

        $criteria = RubricCriteria::active()->ordered()->get();

        $evaluation = Evaluation::where('portfolio_id', $assignment->portfolio_id)
            ->where('evaluator_id', auth()->id())
            ->with('scores')
            ->first();

        return Inertia::render('evaluator/portfolios/show', [
            'assignment' => $assignment,
            'categories' => $categories,
            'uploadedCategoryIds' => $uploadedCategoryIds,
            'progress' => [
                'required' => $requiredCount,
                'completed' => $completedRequiredCount,
                'percentage' => $requiredCount > 0
                    ? round(($completedRequiredCount / $requiredCount) * 100)
                    : 100,
            ],
            'criteria' => $criteria,
            'evaluation' => $evaluation,
        ]);
    }

    public function saveEvaluation(Request $request, PortfolioAssignment $assignment): RedirectResponse
    {
        if ($assignment->evaluator_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'scores' => ['required', 'array'],
            'scores.*.criteria_id' => ['required', 'exists:rubric_criterias,id'],
            'scores.*.score' => ['required', 'integer', 'min:0'],
            'scores.*.comments' => ['nullable', 'string', 'max:1000'],
            'overall_comments' => ['nullable', 'string', 'max:5000'],
            'recommendation' => ['nullable', 'string', 'in:approve,revise,reject'],
        ]);

        $evaluation = Evaluation::updateOrCreate(
            [
                'portfolio_id' => $assignment->portfolio_id,
                'evaluator_id' => auth()->id(),
            ],
            [
                'assignment_id' => $assignment->id,
                'status' => EvaluationStatus::Draft,
                'overall_comments' => $request->input('overall_comments'),
                'recommendation' => $request->input('recommendation'),
            ],
        );

        foreach ($request->input('scores', []) as $scoreData) {
            $criteria = RubricCriteria::findOrFail($scoreData['criteria_id']);

            $evaluation->scores()->updateOrCreate(
                ['rubric_criteria_id' => $scoreData['criteria_id']],
                [
                    'score' => min($scoreData['score'], $criteria->max_score),
                    'comments' => $scoreData['comments'] ?? null,
                ],
            );
        }

        $evaluation->calculateTotalScore();

        if ($assignment->isPending()) {
            $assignment->update(['status' => AssignmentStatus::InProgress]);
        }

        return back()->with('success', 'Evaluation saved as draft.');
    }

    public function submitEvaluation(Request $request, PortfolioAssignment $assignment): RedirectResponse
    {
        if ($assignment->evaluator_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'scores' => ['required', 'array'],
            'scores.*.criteria_id' => ['required', 'exists:rubric_criterias,id'],
            'scores.*.score' => ['required', 'integer', 'min:0'],
            'scores.*.comments' => ['nullable', 'string', 'max:1000'],
            'overall_comments' => ['required', 'string', 'max:5000'],
            'recommendation' => ['required', 'string', 'in:approve,revise,reject'],
        ]);

        $evaluation = Evaluation::updateOrCreate(
            [
                'portfolio_id' => $assignment->portfolio_id,
                'evaluator_id' => auth()->id(),
            ],
            [
                'assignment_id' => $assignment->id,
                'status' => EvaluationStatus::Submitted,
                'overall_comments' => $request->input('overall_comments'),
                'recommendation' => $request->input('recommendation'),
                'submitted_at' => now(),
            ],
        );

        foreach ($request->input('scores', []) as $scoreData) {
            $criteria = RubricCriteria::findOrFail($scoreData['criteria_id']);

            $evaluation->scores()->updateOrCreate(
                ['rubric_criteria_id' => $scoreData['criteria_id']],
                [
                    'score' => min($scoreData['score'], $criteria->max_score),
                    'comments' => $scoreData['comments'] ?? null,
                ],
            );
        }

        $evaluation->calculateTotalScore();

        $assignment->update([
            'status' => AssignmentStatus::Completed,
            'completed_at' => now(),
        ]);

        $portfolio = $assignment->portfolio;
        if ($portfolio->status === PortfolioStatus::UnderReview) {
            $portfolio->update(['status' => PortfolioStatus::Evaluated]);
        }

        $evaluation->load(['portfolio', 'evaluator']);
        $portfolio->load('user');
        $portfolio->user->notify(new EvaluationCompletedNotification($evaluation));

        $admins = User::whereIn('role', [UserRole::Admin, UserRole::SuperAdmin])->get();
        Notification::send($admins, new EvaluationCompletedNotification($evaluation));
        return redirect()->route('evaluator.portfolios.index')
            ->with('success', 'Evaluation submitted successfully.');
    }
}
