<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
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
                'subjectEvaluations',
            ])
            ->get()
            ->map(function (PortfolioSubject $ps) {
                $latestPre = $ps->preAssessmentAttempts->first();
                $byCategory = $ps->subjectEvaluations
                    ->where('status', \App\Enums\SubjectEvaluationStatus::Submitted)
                    ->groupBy(fn ($e) => $e->category->value)
                    ->map(fn ($group) => $group->sortByDesc('attempt_number')->first());

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
                    ] : null,
                    'interview' => $this->formatEval($byCategory->get('interview')),
                    'worksite_visit' => $this->formatEval($byCategory->get('worksite_visit')),
                    'written_exam' => $this->formatEval($byCategory->get('written_exam')),
                ];
            });

        return Inertia::render('applicant/grades/index', [
            'rows' => $portfolioSubjects,
        ]);
    }

    /**
     * @return array{score:float|null,max_score:float|null,submitted_at:mixed}|null
     */
    protected function formatEval($evaluation): ?array
    {
        if (! $evaluation) {
            return null;
        }

        return [
            'score' => (float) $evaluation->score,
            'max_score' => (float) $evaluation->max_score,
            'submitted_at' => $evaluation->submitted_at,
        ];
    }
}
