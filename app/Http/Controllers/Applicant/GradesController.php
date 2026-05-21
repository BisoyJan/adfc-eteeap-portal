<?php

namespace App\Http\Controllers\Applicant;

use App\Enums\EvaluationStatus;
use App\Enums\SubjectEvaluationStatus;
use App\Http\Controllers\Controller;
use App\Models\Evaluation;
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
                'subjectEvaluations.evaluator:id,name',
            ])
            ->get()
            ->map(function (PortfolioSubject $ps) {
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
                    'pre_assessment' => $this->formatEval($byCategory->get('pre_assessment'), $academicYear, $program),
                    'written_exam' => $this->formatEval($byCategory->get('written_exam'), $academicYear, $program),
                ];
            });

        // Interview is stored in the evaluations table (Evaluation model, portfolio-level rubric)
        $interviewEval = Evaluation::query()
            ->whereHas('portfolio', fn ($q) => $q->where('user_id', auth()->id()))
            ->where('status', EvaluationStatus::Submitted->value)
            ->with('evaluator:id,name')
            ->orderByDesc('submitted_at')
            ->first();

        // Worksite Visit is stored in portfolio_evaluations table (PortfolioEvaluation model)
        $worksiteEval = PortfolioEvaluation::query()
            ->whereHas('portfolio', fn ($q) => $q->where('user_id', auth()->id()))
            ->with('evaluator:id,name')
            ->where('status', SubjectEvaluationStatus::Submitted->value)
            ->where('category', 'worksite_visit')
            ->orderByDesc('attempt_number')
            ->first();

        return Inertia::render('applicant/grades/index', [
            'rows' => $portfolioSubjects,
            'interview' => $this->formatInterviewEval($interviewEval),
            'worksite_visit' => $this->formatPortfolioEval($worksiteEval),
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
     * Format an interview Evaluation (from the evaluations table).
     *
     * @return array{score:float,max_score:float,submitted_at:mixed,evaluation_date:mixed,evaluator_name:string|null}|null
     */
    protected function formatInterviewEval($evaluation): ?array
    {
        if (! $evaluation) {
            return null;
        }

        return [
            'score' => (float) $evaluation->total_score,
            'max_score' => (float) $evaluation->max_possible_score,
            'submitted_at' => $evaluation->submitted_at,
            'evaluation_date' => $evaluation->submitted_at,
            'evaluator_name' => $evaluation->evaluator?->name,
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
