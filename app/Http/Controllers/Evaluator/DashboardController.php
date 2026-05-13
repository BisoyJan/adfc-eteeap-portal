<?php

namespace App\Http\Controllers\Evaluator;

use App\Enums\AssignmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\PortfolioAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
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

        // Priority queue: overdue first, then by due_date asc, then by assigned_at
        $priorityQueue = PortfolioAssignment::where('evaluator_id', $user->id)
            ->whereIn('status', [AssignmentStatus::Pending, AssignmentStatus::InProgress])
            ->with(['portfolio.user'])
            ->get()
            ->map(function (PortfolioAssignment $assignment) {
                $isOverdue = $assignment->due_date && $assignment->due_date->isPast();
                $daysRemaining = $assignment->due_date
                    ? now()->diffInDays($assignment->due_date, false)
                    : null;

                return array_merge($assignment->toArray(), [
                    'is_overdue' => $isOverdue,
                    'days_remaining' => $daysRemaining,
                ]);
            })
            ->sortBy([
                fn ($a) => ! $a['is_overdue'],            // overdue first
                fn ($a) => $a['days_remaining'] ?? PHP_INT_MAX, // closest deadline next
            ])
            ->values()
            ->take(10);

        $announcements = Announcement::query()
            ->published()
            ->forRole('evaluator')
            ->latest('published_at')
            ->take(5)
            ->get();

        return Inertia::render('evaluator/dashboard', [
            'stats' => $stats,
            'recentNotifications' => $recentNotifications,
            'priorityQueue' => $priorityQueue,
            'announcements' => $announcements,
        ]);
    }
}
