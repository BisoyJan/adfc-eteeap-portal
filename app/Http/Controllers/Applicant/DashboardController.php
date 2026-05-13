<?php

namespace App\Http\Controllers\Applicant;

use App\Enums\PortfolioStatus;
use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
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

        // Document category progress for each in-progress portfolio
        $requiredCategories = DocumentCategory::where('is_required', true)->count();

        $portfolioProgress = $recentPortfolios->map(function ($portfolio) use ($requiredCategories) {
            $uploadedRequired = $portfolio->documents
                ->filter(fn ($doc) => $doc->category?->is_required)
                ->pluck('document_category_id')
                ->unique()
                ->count();

            return [
                'id' => $portfolio->id,
                'title' => $portfolio->title,
                'status' => $portfolio->status,
                'required_total' => $requiredCategories,
                'required_completed' => $uploadedRequired,
                'percentage' => $requiredCategories > 0
                    ? round(($uploadedRequired / $requiredCategories) * 100)
                    : 100,
            ];
        });

        // Upcoming deadlines from assignments
        $upcomingDeadlines = $user->portfolios()
            ->with(['assignments' => fn ($q) => $q->whereNotNull('due_date')
                ->where('due_date', '>=', now())
                ->with('evaluator:id,name')
                ->orderBy('due_date'),
            ])
            ->get()
            ->flatMap(fn ($p) => $p->assignments->map(fn ($a) => [
                'portfolio_id' => $p->id,
                'portfolio_title' => $p->title,
                'evaluator' => $a->evaluator ? ['id' => $a->evaluator->id, 'name' => $a->evaluator->name] : null,
                'due_date' => $a->due_date,
                'days_remaining' => now()->diffInDays($a->due_date, false),
            ]))
            ->sortBy('due_date')
            ->values()
            ->take(5);

        // Announcements targeted to applicants or all
        $announcements = Announcement::query()
            ->published()
            ->forRole('applicant')
            ->latest('published_at')
            ->take(5)
            ->get();

        return Inertia::render('applicant/dashboard', [
            'stats' => $stats,
            'recentNotifications' => $recentNotifications,
            'recentPortfolios' => $recentPortfolios,
            'portfolioProgress' => $portfolioProgress,
            'upcomingDeadlines' => $upcomingDeadlines,
            'announcements' => $announcements,
        ]);
    }
}
