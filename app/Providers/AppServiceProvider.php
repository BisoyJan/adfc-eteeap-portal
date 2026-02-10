<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureGates();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }

    /**
     * Configure authorization gates.
     */
    protected function configureGates(): void
    {
        Gate::define('manage-users', function (User $user): bool {
            return $user->hasRole(UserRole::SuperAdmin, UserRole::Admin);
        });

        Gate::define('manage-portfolios', function (User $user): bool {
            return $user->hasRole(UserRole::SuperAdmin, UserRole::Admin);
        });

        Gate::define('evaluate-portfolios', function (User $user): bool {
            return $user->hasRole(UserRole::Evaluator);
        });

        Gate::define('submit-portfolios', function (User $user): bool {
            return $user->hasRole(UserRole::Applicant);
        });

        Gate::define('manage-rubrics', function (User $user): bool {
            return $user->hasRole(UserRole::SuperAdmin, UserRole::Admin);
        });

        Gate::define('manage-system', function (User $user): bool {
            return $user->hasRole(UserRole::SuperAdmin);
        });
    }
}
