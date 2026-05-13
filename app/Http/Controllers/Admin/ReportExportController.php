<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EvaluationStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\EvaluationScore;
use App\Models\Portfolio;
use App\Models\RubricCriteria;
use App\Models\WaiverRecommendation;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExportController extends Controller
{
    public function portfolios(): StreamedResponse
    {
        $portfolios = Portfolio::query()
            ->with(['user', 'assignments.evaluator'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->csv('portfolios-export', function () use ($portfolios) {
            $out = fopen('php://output', 'w');

            fputcsv($out, [
                'Applicant Name',
                'Applicant Email',
                'Status',
                'Submitted Date',
                'Last Updated',
                'Assigned Evaluators',
            ]);

            foreach ($portfolios as $portfolio) {
                $evaluators = $portfolio->assignments
                    ->pluck('evaluator.name')
                    ->filter()
                    ->implode('; ');

                fputcsv($out, [
                    $portfolio->user?->name ?? '—',
                    $portfolio->user?->email ?? '—',
                    $portfolio->status->label(),
                    $portfolio->submitted_at?->format('Y-m-d H:i') ?? '—',
                    $portfolio->updated_at->format('Y-m-d H:i'),
                    $evaluators ?: '—',
                ]);
            }

            fclose($out);
        });
    }

    public function evaluators(): StreamedResponse
    {
        $evaluators = \App\Models\User::query()
            ->where('role', UserRole::Evaluator)
            ->withCount([
                'evaluatorAssignments as total_assignments',
                'evaluatorAssignments as completed_assignments' => fn ($q) => $q->where('status', 'completed'),
                'evaluatorAssignments as pending_assignments' => fn ($q) => $q->whereIn('status', ['pending', 'in_progress']),
            ])
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return $this->csv('evaluator-performance-export', function () use ($evaluators) {
            $out = fopen('php://output', 'w');

            fputcsv($out, [
                'Evaluator Name',
                'Email',
                'Total Assigned',
                'Completed',
                'Pending',
                'Average Score (%)',
            ]);

            foreach ($evaluators as $evaluator) {
                $avgScore = Evaluation::where('evaluator_id', $evaluator->id)
                    ->where('status', EvaluationStatus::Submitted)
                    ->whereNotNull('total_score')
                    ->whereNotNull('max_possible_score')
                    ->where('max_possible_score', '>', 0)
                    ->selectRaw('ROUND(AVG(total_score / max_possible_score * 100), 1) as avg_percentage')
                    ->value('avg_percentage') ?? '—';

                fputcsv($out, [
                    $evaluator->name,
                    $evaluator->email,
                    $evaluator->total_assignments,
                    $evaluator->completed_assignments,
                    $evaluator->pending_assignments,
                    $avgScore,
                ]);
            }

            fclose($out);
        });
    }

    public function criteria(): StreamedResponse
    {
        $criteria = RubricCriteria::query()
            ->active()
            ->ordered()
            ->get();

        return $this->csv('competency-criteria-export', function () use ($criteria) {
            $out = fopen('php://output', 'w');

            fputcsv($out, [
                'Criteria Name',
                'Max Score',
                'Average Score',
                'Percentage (%)',
                'Evaluations Count',
            ]);

            foreach ($criteria as $item) {
                $scores = EvaluationScore::where('rubric_criteria_id', $item->id)
                    ->whereHas('evaluation', fn ($q) => $q->where('status', EvaluationStatus::Submitted))
                    ->get();

                $avgScore = $scores->count() > 0 ? round($scores->avg('score'), 1) : 0;
                $percentage = $item->max_score > 0
                    ? round(($avgScore / $item->max_score) * 100, 1)
                    : 0;

                fputcsv($out, [
                    $item->name,
                    $item->max_score,
                    $avgScore,
                    $percentage,
                    $scores->count(),
                ]);
            }

            fclose($out);
        });
    }

    public function waivers(): StreamedResponse
    {
        $waivers = WaiverRecommendation::query()
            ->with(['portfolio.user', 'evaluation.evaluator'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->csv('course-waivers-export', function () use ($waivers) {
            $out = fopen('php://output', 'w');

            fputcsv($out, [
                'Course Code',
                'Course Name',
                'Applicant Name',
                'Applicant Email',
                'Evaluator Name',
                'Status',
                'Notes',
                'Date',
            ]);

            foreach ($waivers as $waiver) {
                fputcsv($out, [
                    $waiver->course_code,
                    $waiver->course_name,
                    $waiver->portfolio?->user?->name ?? '—',
                    $waiver->portfolio?->user?->email ?? '—',
                    $waiver->evaluation?->evaluator?->name ?? '—',
                    $waiver->status,
                    $waiver->notes ?? '',
                    $waiver->created_at->format('Y-m-d'),
                ]);
            }

            fclose($out);
        });
    }

    private function csv(string $name, callable $callback): StreamedResponse
    {
        $filename = $name.'-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }
}
