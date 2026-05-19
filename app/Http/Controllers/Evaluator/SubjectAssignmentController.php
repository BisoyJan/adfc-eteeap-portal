<?php

namespace App\Http\Controllers\Evaluator;

use App\Enums\RubricCategory;
use App\Enums\SubjectAssignmentStatus;
use App\Enums\SubjectEvaluationStatus;
use App\Enums\SubjectRecommendation;
use App\Http\Controllers\Controller;
use App\Models\PortfolioSubject;
use App\Models\PreAssessmentAttempt;
use App\Models\RubricCriteria;
use App\Models\SubjectEvaluation;
use App\Models\SubjectModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SubjectAssignmentController extends Controller
{
    public function index(): Response
    {
        $assignments = PortfolioSubject::query()
            ->where('evaluator_id', auth()->id())
            ->with([
                'subject.academicYear',
                'portfolio.user:id,name,email',
            ])
            ->latest('assigned_at')
            ->paginate(20);

        return Inertia::render('evaluator/subjects/index', [
            'assignments' => $assignments,
            'statuses' => SubjectAssignmentStatus::options(),
        ]);
    }

    public function show(PortfolioSubject $portfolioSubject): Response
    {
        $this->authorizeOwn($portfolioSubject);

        $portfolioSubject->load([
            'portfolio.user',
            'subject.academicYear',
            'subject.modules.uploader:id,name',
            'subject.preAssessmentQuestions' => fn ($q) => $q->ordered(),
            'preAssessmentAttempts.answers.question',
            'preAssessmentAttempts.grader:id,name',
            'subjectEvaluations.scores.criteria',
        ]);

        $rubricByCategory = RubricCriteria::active()
            ->ordered()
            ->get()
            ->groupBy(fn ($c) => $c->category->value);

        return Inertia::render('evaluator/subjects/show', [
            'portfolioSubject' => $portfolioSubject,
            'rubricByCategory' => $rubricByCategory,
            'categories' => RubricCategory::options(),
            'recommendations' => SubjectRecommendation::options(),
            'statuses' => SubjectAssignmentStatus::options(),
        ]);
    }

    public function gradePreAssessment(Request $request, PortfolioSubject $portfolioSubject, PreAssessmentAttempt $attempt): RedirectResponse
    {
        $this->authorizeOwn($portfolioSubject);
        abort_unless($attempt->portfolio_subject_id === $portfolioSubject->id, 404);

        $data = $request->validate([
            'score' => ['required', 'numeric', 'min:0'],
            'max_score' => ['required', 'numeric', 'min:0'],
            'grader_comments' => ['nullable', 'string', 'max:5000'],
        ]);

        $attempt->update([
            'score' => $data['score'],
            'max_score' => $data['max_score'],
            'grader_comments' => $data['grader_comments'] ?? null,
            'graded_by' => auth()->id(),
            'graded_at' => now(),
        ]);

        $this->touchInProgress($portfolioSubject);

        return back()->with('success', 'Pre-assessment graded.');
    }

    public function saveEvaluation(Request $request, PortfolioSubject $portfolioSubject): RedirectResponse
    {
        $this->authorizeOwn($portfolioSubject);

        $data = $request->validate([
            'category' => ['required', 'string', 'in:'.implode(',', RubricCategory::values())],
            'attempt_number' => ['nullable', 'integer', 'min:1'],
            'comments' => ['nullable', 'string', 'max:5000'],
            'conducted_at' => ['nullable', 'date'],
            'submit' => ['nullable', 'boolean'],
            'scores' => ['required', 'array'],
            'scores.*.rubric_criteria_id' => ['required', 'exists:rubric_criterias,id'],
            'scores.*.score' => ['required', 'numeric', 'min:0'],
            'scores.*.comments' => ['nullable', 'string', 'max:2000'],
        ]);

        $attemptNumber = $data['attempt_number'] ?? 1;
        $submit = $data['submit'] ?? false;

        DB::transaction(function () use ($portfolioSubject, $data, $attemptNumber, $submit) {
            $evaluation = SubjectEvaluation::updateOrCreate(
                [
                    'portfolio_subject_id' => $portfolioSubject->id,
                    'category' => $data['category'],
                    'attempt_number' => $attemptNumber,
                ],
                [
                    'evaluator_id' => auth()->id(),
                    'status' => $submit ? SubjectEvaluationStatus::Submitted : SubjectEvaluationStatus::Draft,
                    'comments' => $data['comments'] ?? null,
                    'conducted_at' => $data['conducted_at'] ?? null,
                    'submitted_at' => $submit ? now() : null,
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

        $this->touchInProgress($portfolioSubject);

        return back()->with('success', $submit ? 'Evaluation submitted.' : 'Evaluation saved as draft.');
    }

    public function updateAssignment(Request $request, PortfolioSubject $portfolioSubject): RedirectResponse
    {
        $this->authorizeOwn($portfolioSubject);

        $data = $request->validate([
            'status' => ['required', 'string', 'in:'.implode(',', SubjectAssignmentStatus::values())],
            'recommendation' => ['nullable', 'string', 'in:'.implode(',', SubjectRecommendation::values())],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $portfolioSubject->update([
            ...$data,
            'completed_at' => $data['status'] === SubjectAssignmentStatus::Completed->value
                ? now()
                : null,
        ]);

        return back()->with('success', 'Assignment updated.');
    }

    public function downloadModule(SubjectModule $module): StreamedResponse
    {
        // verify evaluator is assigned to a portfolio_subject of this subject
        $allowed = PortfolioSubject::where('evaluator_id', auth()->id())
            ->where('subject_id', $module->subject_id)
            ->exists();

        abort_unless($allowed, 403);

        return Storage::disk('public')->download($module->file_path, $module->file_name);
    }

    protected function authorizeOwn(PortfolioSubject $portfolioSubject): void
    {
        abort_unless($portfolioSubject->evaluator_id === auth()->id(), 403);
    }

    protected function touchInProgress(PortfolioSubject $portfolioSubject): void
    {
        if ($portfolioSubject->status === SubjectAssignmentStatus::Pending) {
            $portfolioSubject->update(['status' => SubjectAssignmentStatus::InProgress]);
        }
    }
}
