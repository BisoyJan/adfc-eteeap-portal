<?php

namespace App\Http\Controllers\Evaluator;

use App\Enums\PortfolioStatus;
use App\Enums\RubricCategory;
use App\Enums\SubjectAssignmentStatus;
use App\Enums\SubjectEvaluationStatus;
use App\Enums\SubjectRecommendation;
use App\Http\Controllers\Controller;
use App\Models\PortfolioAssignment;
use App\Models\PortfolioEvaluation;
use App\Models\PortfolioSubject;
use App\Models\PreAssessmentAttempt;
use App\Models\RubricCriteria;
use App\Models\SubjectEvaluation;
use App\Models\SubjectModule;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SubjectAssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        $portfolioId = (int) $request->query('portfolio_id', 0);

        $assignments = $this->visibleAssignmentsQuery()
            ->when($portfolioId > 0, fn ($q) => $q->where('portfolio_id', $portfolioId))
            ->with([
                'subject.academicYear',
                'portfolio.user:id,name,email',
            ])
            ->latest('assigned_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('evaluator/subjects/index', [
            'assignments' => $assignments,
            'statuses' => SubjectAssignmentStatus::options(),
            'filters' => [
                'portfolio_id' => $portfolioId > 0 ? $portfolioId : null,
            ],
        ]);
    }

    public function enrollApplicant(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'portfolio_id' => ['required', 'integer', 'exists:portfolios,id'],
            'subject_id' => [
                'required',
                'integer',
                Rule::exists('subjects', 'id')->where(fn ($query) => $query->where('is_active', true)),
            ],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $eligibleAssignment = $this->enrollableAssignmentsQuery()
            ->where('portfolio_id', $data['portfolio_id'])
            ->first();

        abort_unless($eligibleAssignment !== null, 403);

        $alreadyAssigned = PortfolioSubject::query()
            ->where('portfolio_id', $data['portfolio_id'])
            ->where('subject_id', $data['subject_id'])
            ->exists();

        if ($alreadyAssigned) {
            return back()->with('error', 'That subject is already assigned to this applicant.');
        }

        PortfolioSubject::create([
            'portfolio_id' => $data['portfolio_id'],
            'subject_id' => $data['subject_id'],
            'evaluator_id' => auth()->id(),
            'assigned_by' => auth()->id(),
            'status' => SubjectAssignmentStatus::Pending,
            'notes' => $data['notes'] ?? null,
            'assigned_at' => now(),
        ]);

        return back()->with('success', 'Applicant enrolled to subject successfully.');
    }

    public function show(PortfolioSubject $portfolioSubject): Response
    {
        $this->authorizeVisible($portfolioSubject);

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
        $this->authorizeVisible($portfolioSubject);
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
        $this->authorizeVisible($portfolioSubject);

        $data = $request->validate([
            'category' => ['required', 'string', 'in:'.implode(',', RubricCategory::subjectLevelValues())],
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
            $existingEvaluation = SubjectEvaluation::query()
                ->where('portfolio_subject_id', $portfolioSubject->id)
                ->where('category', $data['category'])
                ->where('attempt_number', $attemptNumber)
                ->first();

            $conductedAt = $data['conducted_at']
                ?? $existingEvaluation?->conducted_at
                ?? ($submit ? now() : null);

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
                    'conducted_at' => $conductedAt,
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

    public function savePortfolioEvaluation(Request $request, PortfolioSubject $portfolioSubject): RedirectResponse
    {
        $this->authorizeVisible($portfolioSubject);

        $data = $request->validate([
            'category' => ['required', 'string', 'in:'.implode(',', RubricCategory::portfolioLevelValues())],
            'attempt_number' => ['nullable', 'integer', 'min:1'],
            'comments' => ['nullable', 'string', 'max:5000'],
            'conducted_at' => ['nullable', 'date'],
            'submit' => ['nullable', 'boolean'],
            'scores' => ['required', 'array'],
            'scores.*.rubric_criteria_id' => ['required', 'exists:rubric_criterias,id'],
            'scores.*.score' => ['required', 'numeric', 'min:0'],
            'scores.*.comments' => ['nullable', 'string', 'max:2000'],
        ]);

        $portfolioId = $portfolioSubject->portfolio_id;
        $attemptNumber = $data['attempt_number'] ?? 1;
        $submit = $data['submit'] ?? false;

        DB::transaction(function () use ($portfolioId, $data, $attemptNumber, $submit) {
            $existing = PortfolioEvaluation::query()
                ->where('portfolio_id', $portfolioId)
                ->where('category', $data['category'])
                ->where('attempt_number', $attemptNumber)
                ->first();

            $conductedAt = $data['conducted_at']
                ?? $existing?->conducted_at
                ?? ($submit ? now() : null);

            $evaluation = PortfolioEvaluation::updateOrCreate(
                [
                    'portfolio_id' => $portfolioId,
                    'category' => $data['category'],
                    'attempt_number' => $attemptNumber,
                ],
                [
                    'evaluator_id' => auth()->id(),
                    'status' => $submit ? SubjectEvaluationStatus::Submitted : SubjectEvaluationStatus::Draft,
                    'comments' => $data['comments'] ?? null,
                    'conducted_at' => $conductedAt,
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

        if ($submit) {
            $portfolioSubject->load('portfolio');
            $portfolioSubject->portfolio->attemptAutoEvaluate();
        }

        return back()->with('success', $submit ? 'Evaluation submitted.' : 'Evaluation saved as draft.');
    }

    public function updateAssignment(Request $request, PortfolioSubject $portfolioSubject): RedirectResponse
    {
        $this->authorizeVisible($portfolioSubject);

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

        $portfolioSubject->load('portfolio');
        $portfolioSubject->portfolio->attemptAutoEvaluate();

        return back()->with('success', 'Assignment updated.');
    }

    public function downloadModule(SubjectModule $module): BinaryFileResponse
    {
        $allowed = $this->visibleAssignmentsQuery()
            ->where('subject_id', $module->subject_id)
            ->exists();

        abort_unless($allowed, 403);

        $disk = Storage::disk('public');
        abort_unless($disk->exists($module->file_path), 404);

        return response()->download($disk->path($module->file_path), $module->file_name);
    }

    public function uploadModule(Request $request, PortfolioSubject $portfolioSubject): RedirectResponse
    {
        $this->authorizeVisible($portfolioSubject);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'file' => ['required', 'file', 'max:51200'],
        ]);

        $file = $request->file('file');
        $path = $file->store("subjects/{$portfolioSubject->subject_id}/modules", 'public');

        SubjectModule::create([
            'subject_id' => $portfolioSubject->subject_id,
            'uploaded_by' => auth()->id(),
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        return back()->with('success', 'Module uploaded successfully.');
    }

    protected function authorizeOwn(PortfolioSubject $portfolioSubject): void
    {
        abort_unless($portfolioSubject->evaluator_id === auth()->id(), 403);
    }

    protected function authorizeVisible(PortfolioSubject $portfolioSubject): void
    {
        $this->authorizeOwn($portfolioSubject);

        abort_unless(
            $this->visibleAssignmentsQuery()->whereKey($portfolioSubject->id)->exists(),
            403,
        );
    }

    protected function enrollableAssignmentsQuery(): Builder
    {
        return PortfolioAssignment::query()
            ->where('evaluator_id', auth()->id())
            ->whereHas('portfolio', fn ($q) => $q->whereIn('status', [
                PortfolioStatus::UnderReview->value,
                PortfolioStatus::Approved->value,
                PortfolioStatus::Evaluated->value,
            ]));
    }

    protected function visibleAssignmentsQuery(): Builder
    {
        return PortfolioSubject::query()
            ->where('evaluator_id', auth()->id())
            ->whereHas('portfolio', fn ($q) => $q->whereIn('status', [
                PortfolioStatus::UnderReview->value,
                PortfolioStatus::Approved->value,
                PortfolioStatus::Evaluated->value,
            ]));
    }

    protected function touchInProgress(PortfolioSubject $portfolioSubject): void
    {
        if ($portfolioSubject->status === SubjectAssignmentStatus::Pending) {
            $portfolioSubject->update(['status' => SubjectAssignmentStatus::InProgress]);
        }
    }
}
