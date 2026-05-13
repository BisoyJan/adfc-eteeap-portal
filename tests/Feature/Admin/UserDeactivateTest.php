<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class UserDeactivateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_admin_can_view_user_show_page(): void
    {
        $admin = User::factory()->admin()->create();
        $applicant = User::factory()->applicant()->create();

        $response = $this->actingAs($admin)->get(route('admin.users.show', $applicant));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/users/show')
            ->has('user')
            ->has('portfolioStats')
            ->has('assignedEvaluators')
        );
    }

    public function test_admin_can_deactivate_user(): void
    {
        $admin = User::factory()->admin()->create();
        $applicant = User::factory()->applicant()->create(['is_active' => true]);

        $response = $this->actingAs($admin)->post(route('admin.users.deactivate', $applicant));

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $applicant->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_activate_user(): void
    {
        $admin = User::factory()->admin()->create();
        $applicant = User::factory()->applicant()->create(['is_active' => false]);

        $response = $this->actingAs($admin)->post(route('admin.users.activate', $applicant));

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $applicant->id,
            'is_active' => true,
        ]);
    }

    public function test_non_admin_cannot_deactivate_user(): void
    {
        $evaluator = User::factory()->evaluator()->create();
        $applicant = User::factory()->applicant()->create();

        $response = $this->actingAs($evaluator)->post(route('admin.users.deactivate', $applicant));

        $response->assertStatus(403);
    }

    public function test_user_list_filters_by_active_status(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->applicant()->create(['is_active' => true]);
        User::factory()->applicant()->create(['is_active' => false]);

        $response = $this->actingAs($admin)->get(route('admin.users.index', ['status' => 'active']));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/users/index')
            ->where('filters.status', 'active')
        );
    }

    public function test_user_list_filters_by_role(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->evaluator()->create();

        $response = $this->actingAs($admin)->get(route('admin.users.index', ['role' => 'evaluator']));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/users/index')
            ->where('filters.role', 'evaluator')
        );
    }
}
