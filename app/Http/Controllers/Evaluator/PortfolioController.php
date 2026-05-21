<?php

namespace App\Http\Controllers\Evaluator;

use App\Enums\AssignmentStatus;
use App\Enums\EvaluationStatus;
use App\Enums\PortfolioStatus;
use App\Enums\RubricCategory;
use App\Enums\SubjectAssignmentStatus;
use App\Enums\SubjectEvaluationStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\DocumentCategory;
use App\Models\Evaluation;
use App\Models\PortfolioAssignment;
use App\Models\PortfolioEvaluation;
use App\Models\PortfolioSubject;
use App\Models\RubricCriteria;
use App\Models\Subject;
use App\Models\User;
use App\Models\WaiverRecommendation;
use App\Notifications\EvaluationCompletedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC')
            ->orderBy('due_date', 'asc')
            ->paginate(10);

        $assignments->getCollection()->transform(function ($assignment) {
            $assignment->days_remaining = $assignment->due_date
                ? (int) now()->diffInDays($assignment->due_date, false)
                : null;

            return $assignment;
        });

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
            'portfolio.user:id,name,email,current_position,years_it_experience,company,highest_education',
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

        $criteria = RubricCriteria::query()
            ->active()
            ->ofCategory(RubricCategory::Interview)
            ->ordered()
            ->get();

        $evaluation = Evaluation::where('portfolio_id', $assignment->portfolio_id)
            ->where('evaluator_id', auth()->id())
            ->with('scores')
            ->first();

        $assignedSubjects = PortfolioSubject::query()
            ->where('portfolio_id', $assignment->portfolio_id)
            ->where('evaluator_id', auth()->id())
            ->with('subject.academicYear')
            ->orderBy('assigned_at')
            ->get();

        $allSubjects = Subject::query()
            ->with('academicYear')
            ->active()
            ->orderBy('academic_year_id')
            ->orderBy('code')
            ->get();

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
            'assignedSubjects' => $assignedSubjects,
            'allSubjects' => $allSubjects,
        ]);
    }

    public function storeSubject(Request $request, PortfolioAssignment $assignment): RedirectResponse
    {
        if ($assignment->evaluator_id !== auth()->id()) {
            abort(403);
        }

        if (! in_array($assignment->portfolio->status, [PortfolioStatus::UnderReview, PortfolioStatus::Approved], true)) {
            return back()->with('error', 'Subjects can only be assigned once the portfolio is under review or has been approved.');
        }

        $data = $request->validate([
            'subject_id' => ['required', 'exists:subjects,id'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $exists = PortfolioSubject::query()
            ->where('portfolio_id', $assignment->portfolio_id)
            ->where('subject_id', $data['subject_id'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'That subject is already assigned to this applicant.');
        }

        PortfolioSubject::create([
            'portfolio_id' => $assignment->portfolio_id,
            'subject_id' => $data['subject_id'],
            'evaluator_id' => auth()->id(),
            'assigned_by' => auth()->id(),
            'status' => SubjectAssignmentStatus::Pending,
            'notes' => $data['notes'] ?? null,
            'assigned_at' => now(),
        ]);

        return back()->with('success', 'Subject assigned successfully.');
    }

    public function destroySubject(PortfolioAssignment $assignment, PortfolioSubject $portfolioSubject): RedirectResponse
    {
        if ($assignment->evaluator_id !== auth()->id()) {
            abort(403);
        }

        if ($portfolioSubject->portfolio_id !== $assignment->portfolio_id || $portfolioSubject->evaluator_id !== auth()->id()) {
            abort(403);
        }

        $portfolioSubject->delete();

        return back()->with('success', 'Subject assignment removed.');
    }

    public function storeWaiver(Request $request, PortfolioAssignment $assignment): RedirectResponse
    {
        if ($assignment->evaluator_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'course_code' => ['required', 'string', 'max:20'],
            'course_name' => ['required', 'string', 'max:255'],
            'academic_units' => ['required', 'integer', 'min:1', 'max:12'],
            'rationale' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', 'in:recommended,not_recommended'],
        ]);

        WaiverRecommendation::create([
            ...$validated,
            'portfolio_id' => $assignment->portfolio_id,
            'evaluator_id' => auth()->id(),
        ]);

        return back()->with('success', 'Waiver recommendation added.');
    }

    public function destroyWaiver(PortfolioAssignment $assignment, WaiverRecommendation $waiver): RedirectResponse
    {
        if ($assignment->evaluator_id !== auth()->id() || $waiver->portfolio_id !== $assignment->portfolio_id) {
            abort(403);
        }

        $waiver->delete();

        return back()->with('success', 'Waiver recommendation removed.');
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
            'recommendation' => ['nullable', 'string', 'in:approve,request_revision,reject'],
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
            'recommendation' => ['required', 'string', 'in:approve,request_revision,reject'],
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
        // Only revision and rejection can be set by the evaluator;
        // approval is reserved for the Admin.  Auto-transition to Evaluated
        // happens separately when all subject grading conditions are met.
        $portfolioStatus = match ($request->input('recommendation')) {
            'request_revision' => PortfolioStatus::RevisionRequested,
            'reject' => PortfolioStatus::Rejected,
            default => PortfolioStatus::UnderReview,
        };

        $portfolio->update(['status' => $portfolioStatus]);

        $evaluation->load(['portfolio', 'evaluator']);
        $portfolio->load('user');
        $portfolio->user->notify(new EvaluationCompletedNotification($evaluation));

        $admins = User::whereIn('role', [UserRole::Admin])->get();
        Notification::send($admins, new EvaluationCompletedNotification($evaluation));

        return redirect()->route('evaluator.portfolios.index')
            ->with('success', 'Evaluation submitted successfully.');
    }

    public function showWorksite(PortfolioAssignment $assignment): Response
    {
        if ($assignment->evaluator_id !== auth()->id()) {
            abort(403);
        }

        $assignment->load(['portfolio.user:id,name,email']);

        $criteria = RubricCriteria::query()
            ->active()
            ->ofCategory(RubricCategory::WorksiteVisit)
            ->ordered()
            ->get();

        $allEvaluations = PortfolioEvaluation::query()
            ->where('portfolio_id', $assignment->portfolio_id)
            ->where('category', RubricCategory::WorksiteVisit->value)
            ->where('evaluator_id', auth()->id())
            ->orderByDesc('attempt_number')
            ->with('scores')
            ->get();

        $currentEvaluation = $allEvaluations->first();
        $pastEvaluations = $allEvaluations->skip(1)->values();

        return Inertia::render('evaluator/portfolios/worksite', [
            'assignment' => $assignment,
            'criteria' => $criteria,
            'evaluation' => $currentEvaluation,
            'pastEvaluations' => $pastEvaluations,
        ]);
    }

    public function saveWorksiteEvaluation(Request $request, PortfolioAssignment $assignment): RedirectResponse
    {
        if ($assignment->evaluator_id !== auth()->id()) {
            abort(403);
        }

        $data = $request->validate([
            'attempt_number' => ['nullable', 'integer', 'min:1'],
            'conducted_at' => ['nullable', 'date'],
            'comments' => ['nullable', 'string', 'max:5000'],
            'scores' => ['required', 'array'],
            'scores.*.rubric_criteria_id' => ['required', 'exists:rubric_criterias,id'],
            'scores.*.score' => ['required', 'numeric', 'min:0'],
            'scores.*.comments' => ['nullable', 'string', 'max:2000'],
        ]);

        $attemptNumber = $data['attempt_number'] ?? 1;

        DB::transaction(function () use ($assignment, $data, $attemptNumber) {
            $existing = PortfolioEvaluation::query()
                ->where('portfolio_id', $assignment->portfolio_id)
                ->where('category', RubricCategory::WorksiteVisit->value)
                ->where('attempt_number', $attemptNumber)
                ->first();

            $conductedAt = $data['conducted_at'] ?? $existing?->conducted_at;

            $evaluation = PortfolioEvaluation::updateOrCreate(
                [
                    'portfolio_id' => $assignment->portfolio_id,
                    'category' => RubricCategory::WorksiteVisit->value,
                    'attempt_number' => $attemptNumber,
                ],
                [
                    'evaluator_id' => auth()->id(),
                    'status' => SubjectEvaluationStatus::Draft,
                    'comments' => $data['comments'] ?? null,
                    'conducted_at' => $conductedAt,
                ],
            );

            foreach ($data['scores'] as $row) {
                $criteria = RubricCriteria::findOrFail($row['rubric_criteria_id']);
                $evaluation->scores()->updateOrCreate(
                    ['rubric_criteria_id' => $row['rubric_criteria_id']],
                    [
                        'score' => min((float) $row['score'], (float) $criteria->max_score),
                        'comments' => $row['comments'] ?? null,
                    ],
                );
            }

            $evaluation->calculateTotalScore();
        });

        return back()->with('success', 'Worksite evaluation saved as draft.');
    }

    public function submitWorksiteEvaluation(Request $request, PortfolioAssignment $assignment): RedirectResponse
    {
        if ($assignment->evaluator_id !== auth()->id()) {
            abort(403);
        }

        $data = $request->validate([
            'attempt_number' => ['nullable', 'integer', 'min:1'],
            'conducted_at' => ['nullable', 'date'],
            'comments' => ['nullable', 'string', 'max:5000'],
            'scores' => ['required', 'array'],
            'scores.*.rubric_criteria_id' => ['required', 'exists:rubric_criterias,id'],
            'scores.*.score' => ['required', 'numeric', 'min:0'],
            'scores.*.comments' => ['nullable', 'string', 'max:2000'],
        ]);

        $attemptNumber = $data['attempt_number'] ?? 1;

        DB::transaction(function () use ($assignment, $data, $attemptNumber) {
            $existing = PortfolioEvaluation::query()
                ->where('portfolio_id', $assignment->portfolio_id)
                ->where('category', RubricCategory::WorksiteVisit->value)
                ->where('attempt_number', $attemptNumber)
                ->first();

            $conductedAt = $data['conducted_at']
                ?? $existing?->conducted_at
                ?? now();

            $evaluation = PortfolioEvaluation::updateOrCreate(
                [
                    'portfolio_id' => $assignment->portfolio_id,
                    'category' => RubricCategory::WorksiteVisit->value,
                    'attempt_number' => $attemptNumber,
                ],
                [
                    'evaluator_id' => auth()->id(),
                    'status' => SubjectEvaluationStatus::Submitted,
                    'comments' => $data['comments'] ?? null,
                    'conducted_at' => $conductedAt,
                    'submitted_at' => now(),
                ],
            );

            foreach ($data['scores'] as $row) {
                $criteria = RubricCriteria::findOrFail($row['rubric_criteria_id']);
                $evaluation->scores()->updateOrCreate(
                    ['rubric_criteria_id' => $row['rubric_criteria_id']],
                    [
                        'score' => min((float) $row['score'], (float) $criteria->max_score),
                        'comments' => $row['comments'] ?? null,
                    ],
                );
            }

            $evaluation->calculateTotalScore();
        });

        $assignment->load('portfolio');
        $assignment->portfolio->attemptAutoEvaluate();

        return back()->with('success', 'Worksite evaluation submitted.');
    }
}
