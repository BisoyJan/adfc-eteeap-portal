<?php

namespace App\Http\Controllers\Evaluator;

use App\Enums\AssignmentStatus;
use App\Http\Controllers\Controller;
use App\Models\PortfolioAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $assignments = PortfolioAssignment::where('evaluator_id', $user->id)
            ->with(['portfolio.user'])
            ->latest('assigned_at')
            ->get();

        $stats = [
            'total' => $assignments->count(),
            'pending' => $assignments->where('status', AssignmentStatus::Pending)->count(),
            'in_progress' => $assignments->where('status', AssignmentStatus::InProgress)->count(),
            'completed' => $assignments->where('status', AssignmentStatus::Completed)->count(),
        ];

        $recentNotifications = $user->notifications()
            ->latest()
            ->take(5)
            ->get();

        $pendingAssignments = PortfolioAssignment::where('evaluator_id', $user->id)
            ->whereIn('status', [AssignmentStatus::Pending, AssignmentStatus::InProgress])
            ->with(['portfolio.user'])
            ->latest('assigned_at')
            ->take(5)
            ->get();

        return Inertia::render('evaluator/dashboard', [
            'stats' => $stats,
            'recentNotifications' => $recentNotifications,
            'pendingAssignments' => $pendingAssignments,
        ]);
    }
}
