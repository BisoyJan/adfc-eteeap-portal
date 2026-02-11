<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AssignmentStatus;
use App\Enums\PortfolioStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
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
        ]);
    }
}
