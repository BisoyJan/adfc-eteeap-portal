<?php

namespace Tests\Feature;

use App\Enums\PortfolioStatus;
use App\Models\Portfolio;
use App\Models\PortfolioAssignment;
use App\Models\PortfolioDocument;
use App\Models\RubricCriteria;
use App\Models\User;
use App\Notifications\EvaluationCompletedNotification;
use App\Notifications\EvaluatorAssignedNotification;
use App\Notifications\PortfolioStatusChangedNotification;
use App\Notifications\PortfolioSubmittedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_admins_are_notified_when_portfolio_is_submitted(): void
    {
        Notification::fake();

        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->for($applicant, 'user')->create(['status' => PortfolioStatus::Draft]);
        PortfolioDocument::factory()->for($portfolio)->create();

        $admin1 = User::factory()->admin()->create();
        $admin2 = User::factory()->admin()->create();
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($applicant)->post(route('applicant.portfolios.submit', $portfolio));

        Notification::assertSentTo($admin1, PortfolioSubmittedNotification::class);
        Notification::assertSentTo($admin2, PortfolioSubmittedNotification::class);
        Notification::assertSentTo($superAdmin, PortfolioSubmittedNotification::class);
    }

    public function test_evaluator_is_notified_when_assigned(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $evaluator = User::factory()->evaluator()->create();
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->for($applicant, 'user')->submitted()->create();

        $this->actingAs($admin)->post(route('admin.portfolios.assign', $portfolio), [
            'evaluator_id' => $evaluator->id,
            'due_date' => now()->addDays(7)->format('Y-m-d'),
            'notes' => 'Please review',
        ]);

        Notification::assertSentTo($evaluator, EvaluatorAssignedNotification::class);
    }

    public function test_applicant_is_notified_when_status_changes(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->for($applicant, 'user')->submitted()->create();

        $this->actingAs($admin)->put(route('admin.portfolios.status', $portfolio), [
            'status' => 'revision_requested',
            'admin_notes' => 'Please revise section 2',
        ]);

        Notification::assertSentTo($applicant, PortfolioStatusChangedNotification::class);
    }

    public function test_applicant_and_admins_notified_when_evaluation_submitted(): void
    {
        Notification::fake();

        $admin = User::factory()->admin()->create();
        $evaluator = User::factory()->evaluator()->create();
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->for($applicant, 'user')->underReview()->create();
        $assignment = PortfolioAssignment::factory()->create([
            'portfolio_id' => $portfolio->id,
            'evaluator_id' => $evaluator->id,
        ]);
        $criteria = RubricCriteria::factory()->create(['max_score' => 20]);

        $this->actingAs($evaluator)->post(route('evaluator.portfolios.submit', $assignment), [
            'scores' => [
                ['criteria_id' => $criteria->id, 'score' => 15, 'comments' => 'Good'],
            ],
            'overall_comments' => 'Well done',
            'recommendation' => 'approve',
        ]);

        Notification::assertSentTo($applicant, EvaluationCompletedNotification::class);
        Notification::assertSentTo($admin, EvaluationCompletedNotification::class);
    }

    public function test_notifications_page_requires_authentication(): void
    {
        $response = $this->get('/notifications');

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_notifications(): void
    {
        $admin = User::factory()->admin()->create();
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->for($applicant, 'user')->create(['status' => PortfolioStatus::Submitted]);

        $admin->notify(new PortfolioSubmittedNotification($portfolio));

        $response = $this->actingAs($admin)->get(route('notifications.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('notifications/index'));
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $admin = User::factory()->admin()->create();
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->for($applicant, 'user')->create(['status' => PortfolioStatus::Submitted]);

        $admin->notify(new PortfolioSubmittedNotification($portfolio));

        $notification = $admin->notifications()->first();

        $this->actingAs($admin)->patch(route('notifications.read', $notification->id));

        $notification->refresh();
        $this->assertNotNull($notification->read_at);
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $admin = User::factory()->admin()->create();
        $applicant = User::factory()->applicant()->create();

        $portfolio1 = Portfolio::factory()->for($applicant, 'user')->create(['status' => PortfolioStatus::Submitted]);
        $portfolio2 = Portfolio::factory()->for($applicant, 'user')->create(['status' => PortfolioStatus::Submitted]);
        $portfolio3 = Portfolio::factory()->for($applicant, 'user')->create(['status' => PortfolioStatus::Submitted]);

        $admin->notify(new PortfolioSubmittedNotification($portfolio1));
        $admin->notify(new PortfolioSubmittedNotification($portfolio2));
        $admin->notify(new PortfolioSubmittedNotification($portfolio3));

        $this->assertCount(3, $admin->unreadNotifications);

        $this->actingAs($admin)->post(route('notifications.mark-all-read'));

        $admin->refresh();
        $this->assertCount(0, $admin->unreadNotifications);
    }

    public function test_user_cannot_mark_other_users_notification(): void
    {
        $user1 = User::factory()->admin()->create();
        $user2 = User::factory()->admin()->create();
        $applicant = User::factory()->applicant()->create();
        $portfolio = Portfolio::factory()->for($applicant, 'user')->create(['status' => PortfolioStatus::Submitted]);

        $user1->notify(new PortfolioSubmittedNotification($portfolio));

        $notification = $user1->notifications()->first();

        $response = $this->actingAs($user2)->patch(route('notifications.read', $notification->id));

        $response->assertStatus(404);
    }
}
