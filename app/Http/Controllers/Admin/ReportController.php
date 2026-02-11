<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EvaluationStatus;
use App\Enums\PortfolioStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\EvaluationScore;
use App\Models\Portfolio;
use App\Models\RubricCriteria;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __invoke(): Response
    {
        $portfoliosByStatus = [];
        foreach (PortfolioStatus::cases() as $status) {
            $portfoliosByStatus[] = [
                'status' => $status->label(),
                'count' => Portfolio::where('status', $status)->count(),
                'color' => $status->color(),
            ];
        }

        $totalPortfolios = Portfolio::count();
        $approvedPortfolios = Portfolio::where('status', PortfolioStatus::Approved)->count();
        $rejectedPortfolios = Portfolio::where('status', PortfolioStatus::Rejected)->count();
        $completionRate = $totalPortfolios > 0
            ? round(($approvedPortfolios / $totalPortfolios) * 100, 1)
            : 0;

        $submittedEvaluations = Evaluation::where('status', EvaluationStatus::Submitted)->count();
        $averageScore = Evaluation::where('status', EvaluationStatus::Submitted)
            ->whereNotNull('total_score')
            ->whereNotNull('max_possible_score')
            ->where('max_possible_score', '>', 0)
            ->selectRaw('ROUND(AVG(total_score / max_possible_score * 100), 1) as avg_percentage')
            ->value('avg_percentage') ?? 0;

        $criteriaPerformance = RubricCriteria::query()
            ->active()
            ->ordered()
            ->get()
            ->map(function (RubricCriteria $criteria) {
                $scores = EvaluationScore::where('rubric_criteria_id', $criteria->id)
                    ->whereHas('evaluation', fn ($q) => $q->where('status', EvaluationStatus::Submitted))
                    ->get();

                $avgScore = $scores->count() > 0 ? round($scores->avg('score'), 1) : 0;

                return [
                    'name' => $criteria->name,
                    'max_score' => $criteria->max_score,
                    'average_score' => $avgScore,
                    'percentage' => $criteria->max_score > 0
                        ? round(($avgScore / $criteria->max_score) * 100, 1)
                        : 0,
                    'evaluations_count' => $scores->count(),
                ];
            });

        $evaluatorPerformance = User::query()
            ->where('role', UserRole::Evaluator)
            ->withCount([
                'evaluatorAssignments as total_assignments',
                'evaluatorAssignments as completed_assignments' => fn ($q) => $q->where('status', 'completed'),
                'evaluatorAssignments as pending_assignments' => fn ($q) => $q->whereIn('status', ['pending', 'in_progress']),
            ])
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(function ($evaluator) {
                $avgScore = Evaluation::where('evaluator_id', $evaluator->id)
                    ->where('status', EvaluationStatus::Submitted)
                    ->whereNotNull('total_score')
                    ->whereNotNull('max_possible_score')
                    ->where('max_possible_score', '>', 0)
                    ->selectRaw('ROUND(AVG(total_score / max_possible_score * 100), 1) as avg_percentage')
                    ->value('avg_percentage') ?? 0;

                return [
                    'name' => $evaluator->name,
                    'email' => $evaluator->email,
                    'total_assignments' => $evaluator->total_assignments,
                    'completed_assignments' => $evaluator->completed_assignments,
                    'pending_assignments' => $evaluator->pending_assignments,
                    'average_score_percentage' => $avgScore,
                ];
            });

        $recommendationBreakdown = Evaluation::query()
            ->where('status', EvaluationStatus::Submitted)
            ->whereNotNull('recommendation')
            ->select('recommendation', DB::raw('count(*) as count'))
            ->groupBy('recommendation')
            ->pluck('count', 'recommendation');

        $monthlySubmissions = Portfolio::query()
            ->where('status', '!=', PortfolioStatus::Draft)
            ->whereNotNull('submitted_at')
            ->where('submitted_at', '>=', now()->subMonths(6))
            ->select(
                DB::raw("DATE_FORMAT(submitted_at, '%Y-%m') as month"),
                DB::raw('count(*) as count'),
            )
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month');

        return Inertia::render('admin/reports', [
            'portfoliosByStatus' => $portfoliosByStatus,
            'summary' => [
                'total_portfolios' => $totalPortfolios,
                'approved_portfolios' => $approvedPortfolios,
                'rejected_portfolios' => $rejectedPortfolios,
                'completion_rate' => $completionRate,
                'total_evaluations' => $submittedEvaluations,
                'average_score' => $averageScore,
                'total_applicants' => User::where('role', UserRole::Applicant)->count(),
                'total_evaluators' => User::where('role', UserRole::Evaluator)->count(),
            ],
            'criteriaPerformance' => $criteriaPerformance,
            'evaluatorPerformance' => $evaluatorPerformance,
            'recommendationBreakdown' => $recommendationBreakdown,
            'monthlySubmissions' => $monthlySubmissions,
        ]);
    }
}
