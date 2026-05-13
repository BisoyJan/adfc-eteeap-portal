<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogUserActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        if (! auth()->check()) {
            return;
        }

        $action = $this->resolveAction($request);

        if ($action === null) {
            return;
        }

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action['key'],
            'description' => $action['description'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => $action['metadata'] ?? null,
        ]);
    }

    private function resolveAction(Request $request): ?array
    {
        $routeName = $request->route()?->getName();

        if ($routeName === null) {
            return null;
        }

        $map = [
            'login' => ['key' => 'login', 'description' => 'User logged in'],
            'logout' => ['key' => 'logout', 'description' => 'User logged out'],
            'applicant.portfolios.submit' => ['key' => 'portfolio_submitted', 'description' => 'Portfolio submitted for review'],
            'admin.portfolios.status' => ['key' => 'portfolio_status_changed', 'description' => 'Portfolio status updated'],
            'admin.portfolios.assign' => ['key' => 'evaluator_assigned', 'description' => 'Evaluator assigned to portfolio'],
            'evaluator.portfolios.submit' => ['key' => 'evaluation_submitted', 'description' => 'Evaluation submitted'],
        ];

        if (! array_key_exists($routeName, $map)) {
            return null;
        }

        return $map[$routeName];
    }
}
