<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AssignmentStatus;
use App\Enums\PortfolioStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\DocumentCategory;
use App\Models\Portfolio;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $portfoliosByStatus = [];
        foreach (PortfolioStatus::cases() as $status) {
            $portfoliosByStatus[$status->value] = [
                'label' => $status->label(),
                'color' => $status->color(),
                'count' => Portfolio::where('status', $status)->count(),
            ];
        }

        $recentSubmissions = Portfolio::query()
            ->with('user')
            ->where('status', '!=', PortfolioStatus::Draft)
            ->latest('submitted_at')
            ->limit(5)
            ->get();

        $pendingAssignments = Portfolio::query()
            ->where('status', PortfolioStatus::Submitted)
            ->whereDoesntHave('assignments')
            ->count();

        $evaluatorWorkload = User::query()
            ->where('role', UserRole::Evaluator)
            ->withCount([
                'evaluatorAssignments as active_assignments_count' => function ($query) {
                    $query->whereIn('status', [
                        AssignmentStatus::Pending,
                        AssignmentStatus::InProgress,
                    ]);
                },
                'evaluatorAssignments as completed_assignments_count' => function ($query) {
                    $query->where('status', AssignmentStatus::Completed);
                },
            ])
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        // Learners with incomplete required document categories
        $requiredCategoryCount = DocumentCategory::where('is_required', true)->count();

        $learnersWithIncompleteRequirements = collect();
        if ($requiredCategoryCount > 0) {
            $learnersWithIncompleteRequirements = Portfolio::query()
                ->whereNotIn('status', [PortfolioStatus::Draft, PortfolioStatus::Approved, PortfolioStatus::Rejected])
                ->with('user:id,name,email')
                ->get()
                ->filter(function (Portfolio $portfolio) use ($requiredCategoryCount) {
                    $uploadedRequired = $portfolio->documents()
                        ->whereHas('category', fn ($q) => $q->where('is_required', true))
                        ->distinct('document_category_id')
                        ->count('document_category_id');

                    return $uploadedRequired < $requiredCategoryCount;
                })
                ->map(fn (Portfolio $portfolio) => [
                    'id' => $portfolio->id,
                    'title' => $portfolio->title,
                    'user' => $portfolio->user,
                    'status' => $portfolio->status->label(),
                ])
                ->values()
                ->take(10);
        }

        // Active learners (not approved/rejected) vs completed (approved)
        $learnerStats = [
            'active' => User::where('role', UserRole::Applicant)
                ->where('is_active', true)
                ->whereHas('portfolios', fn ($q) => $q->whereNotIn('status', [PortfolioStatus::Approved, PortfolioStatus::Rejected]))
                ->count(),
            'completed' => User::where('role', UserRole::Applicant)
                ->whereHas('portfolios', fn ($q) => $q->where('status', PortfolioStatus::Approved))
                ->count(),
            'inactive' => User::where('role', UserRole::Applicant)->where('is_active', false)->count(),
        ];

        $stats = [
            'total_portfolios' => Portfolio::count(),
            'total_applicants' => User::where('role', UserRole::Applicant)->count(),
            'total_evaluators' => User::where('role', UserRole::Evaluator)->count(),
            'pending_assignments' => $pendingAssignments,
        ];

        return Inertia::render('admin/dashboard', [
            'portfoliosByStatus' => $portfoliosByStatus,
            'recentSubmissions' => $recentSubmissions,
            'evaluatorWorkload' => $evaluatorWorkload,
            'stats' => $stats,
            'learnerStats' => $learnerStats,
            'learnersWithIncompleteRequirements' => $learnersWithIncompleteRequirements,
        ]);
    }
}
