<?php

namespace App\Http\Controllers\Applicant;

use App\Enums\PortfolioStatus;
use App\Enums\SubjectEvaluationStatus;
use App\Http\Controllers\Controller;
use App\Models\PortfolioSubject;
use App\Models\PreAssessmentAttempt;
use App\Models\SubjectModule;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SubjectController extends Controller
{
    public function index(): Response
    {
        $portfolioSubjects = $this->visibleSubjectsQuery()
            ->with([
                'subject.academicYear',
                'subject.modules',
                'subject.preAssessmentQuestions' => fn ($q) => $q->active()->ordered(),
                'preAssessmentAttempts' => fn ($q) => $q->orderBy('attempt_number', 'desc'),
                'subjectEvaluations' => fn ($q) => $q->where('status', SubjectEvaluationStatus::Submitted),
            ])
            ->get();

        return Inertia::render('applicant/subjects/index', [
            'portfolioSubjects' => $portfolioSubjects,
        ]);
    }

    public function show(PortfolioSubject $portfolioSubject): Response
    {
        $this->authorizeVisible($portfolioSubject);

        $portfolioSubject->load([
            'subject.academicYear',
            'subject.modules.uploader:id,name',
            'subject.preAssessmentQuestions' => fn ($q) => $q->active()->ordered(),
            'preAssessmentAttempts' => fn ($q) => $q
                ->with(['answers', 'grader:id,name'])
                ->orderByDesc('attempt_number'),
            'subjectEvaluations' => fn ($q) => $q
                ->where('status', SubjectEvaluationStatus::Submitted)
                ->with(['scores.criteria', 'evaluator:id,name'])
                ->orderByDesc('attempt_number'),
            'evaluator:id,name',
        ]);

        return Inertia::render('applicant/subjects/show', [
            'portfolioSubject' => $portfolioSubject,
        ]);
    }

    public function downloadModule(SubjectModule $module): BinaryFileResponse
    {
        $hasAccess = $this->visibleSubjectsQuery()
            ->where('subject_id', $module->subject_id)
            ->exists();

        abort_unless($hasAccess, 403);

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

    public function startPreAssessment(PortfolioSubject $portfolioSubject): RedirectResponse
    {
        $this->authorizeVisible($portfolioSubject);

        /** @var PreAssessmentAttempt|null $latest */
        $latest = $portfolioSubject->preAssessmentAttempts()->orderByDesc('attempt_number')->first();

        if ($latest && ! $latest->isSubmitted()) {
            return redirect()->route('applicant.subjects.pre-assessment.edit', [
                'portfolioSubject' => $portfolioSubject->id,
                'attempt' => $latest->id,
            ]);
        }

        $attempt = $portfolioSubject->preAssessmentAttempts()->create([
            'attempt_number' => ($latest?->attempt_number ?? 0) + 1,
        ]);

        return redirect()->route('applicant.subjects.pre-assessment.edit', [
            'portfolioSubject' => $portfolioSubject->id,
            'attempt' => $attempt->id,
        ]);
    }

    public function editPreAssessment(PortfolioSubject $portfolioSubject, PreAssessmentAttempt $attempt): Response
    {
        $this->authorizeVisible($portfolioSubject);
        abort_unless($attempt->portfolio_subject_id === $portfolioSubject->id, 404);

        $portfolioSubject->load([
            'subject',
            'subject.preAssessmentQuestions' => fn ($q) => $q->active()->ordered(),
        ]);
        $attempt->load('answers');

        return Inertia::render('applicant/subjects/pre-assessment', [
            'portfolioSubject' => $portfolioSubject,
            'attempt' => $attempt,
            'readOnly' => $attempt->isSubmitted(),
        ]);
    }

    public function savePreAssessment(Request $request, PortfolioSubject $portfolioSubject, PreAssessmentAttempt $attempt): RedirectResponse
    {
        $this->authorizeVisible($portfolioSubject);
        abort_unless($attempt->portfolio_subject_id === $portfolioSubject->id, 404);
        abort_if($attempt->isSubmitted(), 422, 'Attempt already submitted.');

        $data = $request->validate([
            'narrative' => ['nullable', 'string', 'max:10000'],
            'answers' => ['nullable', 'array'],
            'answers.*.question_id' => ['required', 'exists:pre_assessment_questions,id'],
            'answers.*.answer' => ['nullable', 'string', 'max:5000'],
            'submit' => ['nullable', 'boolean'],
        ]);

        DB::transaction(function () use ($attempt, $data) {
            $attempt->update([
                'narrative' => $data['narrative'] ?? null,
                'submitted_at' => ($data['submit'] ?? false) ? now() : null,
            ]);

            foreach ($data['answers'] ?? [] as $row) {
                $attempt->answers()->updateOrCreate(
                    ['question_id' => $row['question_id']],
                    ['answer' => $row['answer'] ?? null],
                );
            }
        });

        return back()->with('success', ($data['submit'] ?? false) ? 'Pre-assessment submitted.' : 'Draft saved.');
    }

    protected function authorizeOwn(PortfolioSubject $portfolioSubject): void
    {
        $ownerId = $portfolioSubject->portfolio()->value('user_id');
        abort_unless($ownerId === auth()->id(), 403);
    }

    protected function authorizeVisible(PortfolioSubject $portfolioSubject): void
    {
        $this->authorizeOwn($portfolioSubject);

        abort_unless(
            $this->visibleSubjectsQuery()->whereKey($portfolioSubject->id)->exists(),
            403,
        );
    }

    protected function visibleSubjectsQuery(): Builder
    {
        return PortfolioSubject::query()
            ->whereHas('portfolio', fn ($q) => $q
                ->where('user_id', auth()->id())
                ->whereIn('status', [
                    PortfolioStatus::Approved->value,
                    PortfolioStatus::Evaluated->value,
                ]));
    }
}
