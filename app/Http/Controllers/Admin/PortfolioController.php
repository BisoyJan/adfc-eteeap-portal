<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AssignmentStatus;
use App\Enums\PortfolioStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AssignEvaluatorRequest;
use App\Http\Requests\Admin\UpdatePortfolioStatusRequest;
use App\Models\Portfolio;
use App\Models\PortfolioAssignment;
use App\Models\User;
use App\Notifications\EvaluatorAssignedNotification;
use App\Notifications\PortfolioStatusChangedNotification;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(): Response
    {
        $portfolios = Portfolio::query()
            ->with(['user', 'assignments.evaluator'])
            ->when(request('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when(request('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/portfolios/index', [
            'portfolios' => $portfolios,
            'statuses' => PortfolioStatus::options(),
            'filters' => [
                'status' => request('status', ''),
                'search' => request('search', ''),
            ],
        ]);
    }

    public function show(Portfolio $portfolio): Response
    {
        $portfolio->load([
            'user',
            'documents.category',
            'assignments.evaluator',
            'assignments.assigner',
            'evaluations.evaluator',
            'evaluations.scores.criteria',
        ]);

        $evaluators = User::query()
            ->where('role', UserRole::Evaluator)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $categories = \App\Models\DocumentCategory::orderBy('sort_order')->get();

        $uploadedCategoryIds = $portfolio->documents
            ->pluck('document_category_id')
            ->unique()
            ->values();

        $requiredCount = $categories->where('is_required', true)->count();
        $completedRequiredCount = $categories->where('is_required', true)
            ->whereIn('id', $uploadedCategoryIds)
            ->count();

        return Inertia::render('admin/portfolios/show', [
            'portfolio' => $portfolio,
            'evaluators' => $evaluators,
            'categories' => $categories,
            'uploadedCategoryIds' => $uploadedCategoryIds,
            'progress' => [
                'required' => $requiredCount,
                'completed' => $completedRequiredCount,
                'percentage' => $requiredCount > 0
                    ? round(($completedRequiredCount / $requiredCount) * 100)
                    : 100,
            ],
        ]);
    }

    public function assign(AssignEvaluatorRequest $request, Portfolio $portfolio): RedirectResponse
    {
        $assignment = PortfolioAssignment::updateOrCreate(
            [
                'portfolio_id' => $portfolio->id,
                'evaluator_id' => $request->validated('evaluator_id'),
            ],
            [
                'assigned_by' => auth()->id(),
                'status' => AssignmentStatus::Pending,
                'due_date' => $request->validated('due_date'),
                'notes' => $request->validated('notes'),
                'assigned_at' => now(),
            ],
        );

        if ($portfolio->status === PortfolioStatus::Submitted) {
            $portfolio->update(['status' => PortfolioStatus::UnderReview]);
        }

        $evaluator = User::find($request->validated('evaluator_id'));
        $evaluator->notify(new EvaluatorAssignedNotification($assignment));

        return back()->with('success', 'Evaluator assigned successfully.');
    }

    public function updateStatus(UpdatePortfolioStatusRequest $request, Portfolio $portfolio): RedirectResponse
    {
        $oldStatus = $portfolio->status->value;
        $status = PortfolioStatus::from($request->validated('status'));

        $portfolio->update([
            'status' => $status,
            'admin_notes' => $request->validated('admin_notes'),
        ]);

        $portfolio->load('user');
        $portfolio->user->notify(new PortfolioStatusChangedNotification($portfolio, $oldStatus));

        return back()->with('success', 'Portfolio status updated to '.$status->label().'.');
    }

    public function removeAssignment(Portfolio $portfolio, PortfolioAssignment $assignment): RedirectResponse
    {
        if ($assignment->portfolio_id !== $portfolio->id) {
            abort(404);
        }

        $assignment->delete();

        return back()->with('success', 'Assignment removed successfully.');
    }
}
