<?php

namespace App\Http\Controllers\Applicant;

use App\Enums\PortfolioStatus;
use App\Http\Controllers\Controller;
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

        $portfolios = $user->portfolios()
            ->withCount('documents')
            ->latest()
            ->get();

        $stats = [
            'total' => $portfolios->count(),
            'draft' => $portfolios->where('status', PortfolioStatus::Draft)->count(),
            'submitted' => $portfolios->where('status', PortfolioStatus::Submitted)->count(),
            'under_review' => $portfolios->where('status', PortfolioStatus::UnderReview)->count(),
            'evaluated' => $portfolios->where('status', PortfolioStatus::Evaluated)->count(),
            'approved' => $portfolios->where('status', PortfolioStatus::Approved)->count(),
            'revision_requested' => $portfolios->where('status', PortfolioStatus::RevisionRequested)->count(),
            'rejected' => $portfolios->where('status', PortfolioStatus::Rejected)->count(),
        ];

        $recentNotifications = $user->notifications()
            ->latest()
            ->take(5)
            ->get();

        $recentPortfolios = $user->portfolios()
            ->with('documents')
            ->latest('updated_at')
            ->take(3)
            ->get();

        return Inertia::render('applicant/dashboard', [
            'stats' => $stats,
            'recentNotifications' => $recentNotifications,
            'recentPortfolios' => $recentPortfolios,
        ]);
    }
}
