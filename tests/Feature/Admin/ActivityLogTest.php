<?php

namespace Tests\Feature\Admin;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_admin_can_view_activity_logs(): void
    {
        $admin = User::factory()->admin()->create();
        ActivityLog::factory()->count(3)->create(['user_id' => $admin->id]);

        $response = $this->actingAs($admin)->get(route('admin.activity-logs.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/activity-logs/index')
            ->has('logs')
            ->has('actions')
            ->has('users')
            ->has('filters')
        );
    }

    public function test_non_admin_cannot_view_activity_logs(): void
    {
        $evaluator = User::factory()->evaluator()->create();

        $response = $this->actingAs($evaluator)->get(route('admin.activity-logs.index'));

        $response->assertStatus(403);
    }

    public function test_activity_logs_can_be_filtered_by_action(): void
    {
        $admin = User::factory()->admin()->create();
        ActivityLog::factory()->create(['user_id' => $admin->id, 'action' => 'login']);
        ActivityLog::factory()->create(['user_id' => $admin->id, 'action' => 'logout']);

        $response = $this->actingAs($admin)->get(route('admin.activity-logs.index', ['action' => 'login']));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/activity-logs/index')
            ->where('filters.action', 'login')
        );
    }
}
