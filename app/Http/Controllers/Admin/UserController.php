<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->input('role'), fn ($q, $role) => $q->where('role', $role))
            ->when($request->input('status'), function ($query, $status) {
                if ($status === 'active') {
                    $query->where('is_active', true);
                } elseif ($status === 'inactive') {
                    $query->where('is_active', false);
                }
            })
            ->when($request->input('evaluator_id'), function ($query, $evaluatorId) {
                $query->whereHas('portfolios.assignments', fn ($q) => $q->where('evaluator_id', $evaluatorId));
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $evaluators = User::where('role', UserRole::Evaluator)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => UserRole::options(),
            'evaluators' => $evaluators,
            'filters' => [
                'search' => $request->input('search', ''),
                'role' => $request->input('role', ''),
                'status' => $request->input('status', ''),
                'evaluator_id' => $request->input('evaluator_id', ''),
            ],
        ]);
    }

    public function show(User $user): Response
    {
        $user->load(['portfolios.assignments.evaluator', 'activityLogs' => fn ($q) => $q->latest()->limit(20)]);

        $portfolioStats = [
            'total' => $user->portfolios->count(),
            'approved' => $user->portfolios->where('status.value', 'approved')->count(),
            'under_review' => $user->portfolios->where('status.value', 'under_review')->count(),
        ];

        $assignedEvaluators = $user->portfolios
            ->flatMap(fn ($p) => $p->assignments)
            ->map(fn ($a) => $a->evaluator)
            ->unique('id')
            ->values();

        return Inertia::render('admin/users/show', [
            'user' => $user,
            'portfolioStats' => $portfolioStats,
            'assignedEvaluators' => $assignedEvaluators,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'roles' => UserRole::options(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create($request->validated());

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'roles' => UserRole::options(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->update($request->validated());

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function deactivate(Request $request, User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $user->update([
            'is_active' => false,
            'deactivated_at' => now(),
            'deactivation_reason' => $request->input('reason'),
        ]);

        ActivityLog::record('user_deactivated', "Deactivated account: {$user->name}", [
            'target_user_id' => $user->id,
            'reason' => $request->input('reason'),
        ]);

        return back()->with('success', "{$user->name}'s account has been deactivated.");
    }

    public function activate(User $user): RedirectResponse
    {
        $user->update([
            'is_active' => true,
            'deactivated_at' => null,
            'deactivation_reason' => null,
        ]);

        ActivityLog::record('user_activated', "Reactivated account: {$user->name}", [
            'target_user_id' => $user->id,
        ]);

        return back()->with('success', "{$user->name}'s account has been reactivated.");
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}
