<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_middleware_allows_matching_role(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.users.index'));

        $response->assertStatus(200);
    }

    public function test_middleware_blocks_non_matching_role(): void
    {
        $applicant = User::factory()->applicant()->create();

        $response = $this->actingAs($applicant)->get(route('admin.users.index'));

        $response->assertStatus(403);
    }

    public function test_middleware_allows_multiple_roles(): void
    {
        $admin = User::factory()->admin()->create();
        $superAdmin = User::factory()->superAdmin()->create();

        $adminResponse = $this->actingAs($admin)->get(route('admin.users.index'));
        $adminResponse->assertStatus(200);

        $superAdminResponse = $this->actingAs($superAdmin)->get(route('admin.users.index'));
        $superAdminResponse->assertStatus(200);
    }

    public function test_middleware_blocks_unauthenticated_users(): void
    {
        $response = $this->get(route('admin.users.index'));

        $response->assertRedirect(route('login'));
    }
}
