<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Models\PortfolioSubject;
use App\Models\PreAssessmentAttempt;
use App\Models\SubjectModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SubjectController extends Controller
{
    public function index(): Response
    {
        $portfolioSubjects = PortfolioSubject::query()
            ->whereHas('portfolio', fn ($q) => $q->where('user_id', auth()->id()))
            ->with([
                'subject.academicYear',
                'subject.modules',
                'subject.preAssessmentQuestions' => fn ($q) => $q->active()->ordered(),
                'preAssessmentAttempts' => fn ($q) => $q->orderBy('attempt_number', 'desc'),
                'subjectEvaluations',
            ])
            ->get();

        return Inertia::render('applicant/subjects/index', [
            'portfolioSubjects' => $portfolioSubjects,
        ]);
    }

    public function show(PortfolioSubject $portfolioSubject): Response
    {
        $this->authorizeOwn($portfolioSubject);

        $portfolioSubject->load([
            'subject.academicYear',
            'subject.modules.uploader:id,name',
            'subject.preAssessmentQuestions' => fn ($q) => $q->active()->ordered(),
            'preAssessmentAttempts.answers',
            'preAssessmentAttempts.grader:id,name',
            'subjectEvaluations.scores.criteria',
            'evaluator:id,name',
        ]);

        return Inertia::render('applicant/subjects/show', [
            'portfolioSubject' => $portfolioSubject,
        ]);
    }

    public function downloadModule(SubjectModule $module): StreamedResponse
    {
        // Verify applicant has this subject assigned
        $hasAccess = PortfolioSubject::query()
            ->whereHas('portfolio', fn ($q) => $q->where('user_id', auth()->id()))
            ->where('subject_id', $module->subject_id)
            ->exists();

        abort_unless($hasAccess, 403);

        return Storage::disk('public')->download($module->file_path, $module->file_name);
    }

    public function startPreAssessment(PortfolioSubject $portfolioSubject): RedirectResponse
    {
        $this->authorizeOwn($portfolioSubject);

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
        $this->authorizeOwn($portfolioSubject);
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
        $this->authorizeOwn($portfolioSubject);
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
}
