<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * Ensure the authenticated user has one of the specified roles.
     *
     * @param  string  ...$roles  The allowed role values (e.g., 'admin', 'super_admin', 'evaluator', 'applicant').
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $allowedRoles = array_map(
            fn (string $role): UserRole => UserRole::from($role),
            $roles,
        );

        if (! in_array($request->user()?->role, $allowedRoles, true)) {
            abort(403);
        }

        return $next($request);
    }
}
