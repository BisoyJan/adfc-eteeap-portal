<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $logs = ActivityLog::query()
            ->with('user:id,name,email,role')
            ->when($request->input('user_id'), fn ($q, $id) => $q->where('user_id', $id))
            ->when($request->input('action'), fn ($q, $action) => $q->where('action', $action))
            ->when($request->input('search'), function ($q, $search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(25)
            ->withQueryString();

        $actions = ActivityLog::distinct()->pluck('action')->sort()->values();
        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/activity-logs/index', [
            'logs' => $logs,
            'actions' => $actions,
            'users' => $users,
            'filters' => [
                'user_id' => $request->input('user_id', ''),
                'action' => $request->input('action', ''),
                'search' => $request->input('search', ''),
            ],
        ]);
    }
}
