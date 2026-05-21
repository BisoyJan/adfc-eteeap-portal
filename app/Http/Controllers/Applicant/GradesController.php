<?php

namespace App\Http\Controllers\Applicant;

use App\Enums\SubjectEvaluationStatus;
use App\Http\Controllers\Controller;
use App\Models\PortfolioEvaluation;
use App\Models\PortfolioSubject;
use Inertia\Inertia;
use Inertia\Response;

class GradesController extends Controller
{
    public function __invoke(): Response
    {
        $portfolioSubjects = PortfolioSubject::query()
            ->whereHas('portfolio', fn ($q) => $q->where('user_id', auth()->id()))
            ->with([
                'subject.academicYear',
                'preAssessmentAttempts' => fn ($q) => $q->orderByDesc('attempt_number'),
                'preAssessmentAttempts.grader:id,name',
                'subjectEvaluations.evaluator:id,name',
            ])
            ->get()
            ->map(function (PortfolioSubject $ps) {
                $latestPre = $ps->preAssessmentAttempts->first();
                $byCategory = $ps->subjectEvaluations
                    ->where('status', SubjectEvaluationStatus::Submitted)
                    ->groupBy(fn ($e) => $e->category->value)
                    ->map(fn ($group) => $group->sortByDesc('attempt_number')->first());

                $academicYear = $ps->subject->academicYear?->name;
                $program = 'BSIT';

                return [
                    'id' => $ps->id,
                    'subject' => [
                        'id' => $ps->subject->id,
                        'code' => $ps->subject->code,
                        'name' => $ps->subject->name,
                        'units' => $ps->subject->units,
                        'academic_year' => $ps->subject->academicYear?->name,
                    ],
                    'status' => $ps->status->value,
                    'recommendation' => $ps->recommendation?->value,
                    'recommendation_label' => $ps->recommendation?->label(),
                    'pre_assessment' => $latestPre ? [
                        'attempt_number' => $latestPre->attempt_number,
                        'submitted_at' => $latestPre->submitted_at,
                        'score' => $latestPre->score,
                        'max_score' => $latestPre->max_score,
                        'graded_at' => $latestPre->graded_at,
                        'evaluation_date' => $latestPre->graded_at ?? $latestPre->submitted_at,
                        'evaluator_name' => $latestPre->grader?->name,
                        'academic_year' => $academicYear,
                        'program' => $program,
                    ] : null,
                    'written_exam' => $this->formatEval($byCategory->get('written_exam'), $academicYear, $program),
                ];
            });

        // Portfolio-level evaluations: interview & worksite_visit are graded once per portfolio
        $portfolioEvals = PortfolioEvaluation::query()
            ->whereHas('portfolio', fn ($q) => $q->where('user_id', auth()->id()))
            ->with('evaluator:id,name')
            ->where('status', SubjectEvaluationStatus::Submitted->value)
            ->orderByDesc('attempt_number')
            ->get()
            ->groupBy(fn ($e) => $e->category->value)
            ->map(fn ($group) => $group->first());

        return Inertia::render('applicant/grades/index', [
            'rows' => $portfolioSubjects,
            'interview' => $this->formatPortfolioEval($portfolioEvals['interview'] ?? null),
            'worksite_visit' => $this->formatPortfolioEval($portfolioEvals['worksite_visit'] ?? null),
        ]);
    }

    /**
     * @return array{score:float|null,max_score:float|null,submitted_at:mixed,evaluation_date:mixed,evaluator_name:string|null,academic_year:string|null,program:string}|null
     */
    protected function formatEval($evaluation, ?string $academicYear, string $program): ?array
    {
        if (! $evaluation) {
            return null;
        }

        return [
            'score' => (float) $evaluation->score,
            'max_score' => (float) $evaluation->max_score,
            'submitted_at' => $evaluation->submitted_at,
            'evaluation_date' => $evaluation->conducted_at ?? $evaluation->submitted_at,
            'evaluator_name' => $evaluation->evaluator?->name,
            'academic_year' => $academicYear,
            'program' => $program,
        ];
    }

    /**
     * @return array{score:float,max_score:float,submitted_at:mixed,evaluation_date:mixed,evaluator_name:string|null}|null
     */
    protected function formatPortfolioEval($evaluation): ?array
    {
        if (! $evaluation) {
            return null;
        }

        return [
            'score' => (float) $evaluation->score,
            'max_score' => (float) $evaluation->max_score,
            'submitted_at' => $evaluation->submitted_at,
            'evaluation_date' => $evaluation->conducted_at ?? $evaluation->submitted_at,
            'evaluator_name' => $evaluation->evaluator?->name,
        ];
    }
}
