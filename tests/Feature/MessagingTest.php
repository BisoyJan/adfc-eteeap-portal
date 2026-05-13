<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class MessagingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_authenticated_user_can_view_inbox(): void
    {
        $user = User::factory()->applicant()->create();

        $response = $this->actingAs($user)->get(route('messages.inbox'));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('messages/inbox')
            ->has('messages')
            ->has('unreadCount')
        );
    }

    public function test_authenticated_user_can_view_sent(): void
    {
        $user = User::factory()->applicant()->create();

        $response = $this->actingAs($user)->get(route('messages.sent'));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('messages/sent')
            ->has('messages')
        );
    }

    public function test_user_can_send_message(): void
    {
        $sender = User::factory()->admin()->create();
        $receiver = User::factory()->applicant()->create();

        $response = $this->actingAs($sender)->post(route('messages.store'), [
            'receiver_id' => $receiver->id,
            'subject' => 'Test Subject',
            'body' => 'Hello from sender.',
        ]);

        $response->assertRedirect(route('messages.sent'));
        $this->assertDatabaseHas('messages', [
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'subject' => 'Test Subject',
        ]);
    }

    public function test_user_cannot_send_message_to_self(): void
    {
        $user = User::factory()->applicant()->create();

        $response = $this->actingAs($user)->post(route('messages.store'), [
            'receiver_id' => $user->id,
            'subject' => 'Self message',
            'body' => 'This should fail.',
        ]);

        $response->assertSessionHasErrors('receiver_id');
    }

    public function test_receiver_can_view_message_and_it_marks_as_read(): void
    {
        $sender = User::factory()->admin()->create();
        $receiver = User::factory()->applicant()->create();

        $message = Message::factory()->create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'read_at' => null,
        ]);

        $this->actingAs($receiver)->get(route('messages.show', $message));

        $this->assertNotNull($message->fresh()->read_at);
    }

    public function test_unrelated_user_cannot_view_message(): void
    {
        $sender = User::factory()->admin()->create();
        $receiver = User::factory()->applicant()->create();
        $outsider = User::factory()->evaluator()->create();

        $message = Message::factory()->create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
        ]);

        $response = $this->actingAs($outsider)->get(route('messages.show', $message));

        $response->assertStatus(403);
    }

    public function test_user_can_reply_to_message(): void
    {
        $sender = User::factory()->admin()->create();
        $receiver = User::factory()->applicant()->create();

        $message = Message::factory()->create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
        ]);

        $response = $this->actingAs($receiver)->post(route('messages.reply', $message), [
            'body' => 'This is my reply.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('messages', [
            'sender_id' => $receiver->id,
            'receiver_id' => $sender->id,
            'parent_id' => $message->id,
        ]);
    }

    public function test_admin_can_send_bulk_messages(): void
    {
        $admin = User::factory()->admin()->create();
        $applicants = User::factory()->applicant()->count(3)->create();

        $response = $this->actingAs($admin)->post(route('messages.bulk'), [
            'receiver_ids' => $applicants->pluck('id')->toArray(),
            'subject' => 'Bulk Subject',
            'body' => 'Bulk message body.',
        ]);

        $response->assertRedirect(route('messages.sent'));
        $this->assertDatabaseCount('messages', 3);
    }

    public function test_non_admin_cannot_send_bulk_messages(): void
    {
        $applicant = User::factory()->applicant()->create();
        $others = User::factory()->applicant()->count(2)->create();

        $response = $this->actingAs($applicant)->post(route('messages.bulk'), [
            'receiver_ids' => $others->pluck('id')->toArray(),
            'subject' => 'Bulk',
            'body' => 'Should fail.',
        ]);

        $response->assertStatus(403);
    }

    public function test_user_can_soft_delete_message_from_inbox(): void
    {
        $sender = User::factory()->admin()->create();
        $receiver = User::factory()->applicant()->create();

        $message = Message::factory()->create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
        ]);

        $this->actingAs($receiver)->delete(route('messages.destroy', $message));

        $this->assertNotNull($message->fresh()->receiver_deleted_at);
        $this->assertNull($message->fresh()->sender_deleted_at);
    }

    public function test_guest_cannot_access_inbox(): void
    {
        $response = $this->get(route('messages.inbox'));

        $response->assertRedirect(route('login'));
    }
}
