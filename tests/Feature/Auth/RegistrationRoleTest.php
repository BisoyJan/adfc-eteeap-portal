<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_user_is_registered_as_applicant(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals(UserRole::Applicant, $user->role);
    }

    public function test_user_factory_creates_applicant_by_default(): void
    {
        $user = User::factory()->create();

        $this->assertEquals(UserRole::Applicant, $user->role);
    }

    public function test_user_factory_super_admin_state(): void
    {
        $user = User::factory()->superAdmin()->create();

        $this->assertEquals(UserRole::SuperAdmin, $user->role);
    }

    public function test_user_factory_admin_state(): void
    {
        $user = User::factory()->admin()->create();

        $this->assertEquals(UserRole::Admin, $user->role);
    }

    public function test_user_factory_evaluator_state(): void
    {
        $user = User::factory()->evaluator()->create();

        $this->assertEquals(UserRole::Evaluator, $user->role);
    }
}
