<?php

namespace Database\Factories;

use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    protected $model = Message::class;

    public function definition(): array
    {
        return [
            'sender_id' => User::factory()->admin(),
            'receiver_id' => User::factory()->applicant(),
            'parent_id' => null,
            'subject' => $this->faker->sentence(5),
            'body' => $this->faker->paragraphs(2, true),
            'read_at' => null,
            'sender_deleted_at' => null,
            'receiver_deleted_at' => null,
        ];
    }

    public function read(): static
    {
        return $this->state(fn () => ['read_at' => now()]);
    }
}
