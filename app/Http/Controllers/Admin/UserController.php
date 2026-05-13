<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PortfolioStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'role', 'status', 'evaluator_id']);
        $filters = array_merge(['search' => '', 'role' => '', 'status' => '', 'evaluator_id' => ''], $filters);

        $users = User::query()
            ->when($filters['search'], fn ($q, $s) => $q->where(fn ($q2) => $q2->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")))
            ->when($filters['role'], fn ($q, $r) => $q->where('role', $r))
            ->when($filters['status'] === 'active', fn ($q) => $q->where('is_active', true))
            ->when($filters['status'] === 'inactive', fn ($q) => $q->where('is_active', false))
            ->when($filters['evaluator_id'], fn ($q, $eid) => $q->whereHas('portfolios.assignments', fn ($q2) => $q2->where('evaluator_id', $eid)))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $evaluators = User::query()
            ->where('role', UserRole::Evaluator)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => UserRole::options(),
            'evaluators' => $evaluators,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the specified user's profile.
     */
    public function show(User $user): Response
    {
        $user->load([
            'portfolios.assignments.evaluator:id,name',
            'activityLogs' => fn ($q) => $q->latest()->take(20),
        ]);

        $portfolioStats = [
            'total' => $user->portfolios->count(),
            'approved' => $user->portfolios->where('status', PortfolioStatus::Approved)->count(),
            'under_review' => $user->portfolios->where('status', PortfolioStatus::UnderReview)->count(),
        ];

        $assignedEvaluators = $user->portfolios
            ->flatMap(fn ($p) => $p->assignments->pluck('evaluator')->filter())
            ->unique('id')
            ->values()
            ->map(fn ($e) => ['id' => $e->id, 'name' => $e->name]);

        return Inertia::render('admin/users/show', [
            'user' => $user,
            'portfolioStats' => $portfolioStats,
            'assignedEvaluators' => $assignedEvaluators,
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'roles' => UserRole::options(),
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create($request->validated());

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Show the form for editing a user.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'roles' => UserRole::options(),
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->update($request->validated());

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Deactivate the specified user.
     */
    public function deactivate(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $user->update(['is_active' => false]);

        return back()->with('success', "{$user->name} has been deactivated.");
    }

    /**
     * Activate the specified user.
     */
    public function activate(User $user): RedirectResponse
    {
        $user->update(['is_active' => true]);

        return back()->with('success', "{$user->name} has been activated.");
    }
}
