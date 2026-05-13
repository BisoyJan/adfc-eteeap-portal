<?php

namespace Tests\Feature\Admin;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AnnouncementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_admin_can_list_announcements(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.announcements.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/announcements/index')
            ->has('announcements')
            ->has('targetRoles')
        );
    }

    public function test_admin_can_create_announcement(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('admin.announcements.store'), [
            'title' => 'Test Announcement',
            'body' => 'This is the announcement body.',
            'target_role' => 'all',
            'is_published' => true,
        ]);

        $response->assertRedirect(route('admin.announcements.index'));
        $this->assertDatabaseHas('announcements', [
            'title' => 'Test Announcement',
            'target_role' => 'all',
            'author_id' => $admin->id,
            'is_published' => true,
        ]);
    }

    public function test_admin_can_toggle_publish(): void
    {
        $admin = User::factory()->admin()->create();
        $announcement = Announcement::factory()->create([
            'author_id' => $admin->id,
            'is_published' => false,
        ]);

        $response = $this->actingAs($admin)->post(
            route('admin.announcements.toggle-publish', $announcement)
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('announcements', [
            'id' => $announcement->id,
            'is_published' => true,
        ]);
    }

    public function test_admin_can_delete_announcement(): void
    {
        $admin = User::factory()->admin()->create();
        $announcement = Announcement::factory()->create(['author_id' => $admin->id]);

        $response = $this->actingAs($admin)->delete(
            route('admin.announcements.destroy', $announcement)
        );

        $response->assertRedirect(route('admin.announcements.index'));
        $this->assertDatabaseMissing('announcements', ['id' => $announcement->id]);
    }

    public function test_non_admin_cannot_create_announcement(): void
    {
        $applicant = User::factory()->applicant()->create();

        $response = $this->actingAs($applicant)->post(route('admin.announcements.store'), [
            'title' => 'Hacked',
            'body' => 'Body',
            'target_role' => 'all',
        ]);

        $response->assertStatus(403);
    }
}
