<?php

namespace App\Notifications;

use App\Models\Evaluation;
use Illuminate\Notifications\Notification;

class EvaluationCompletedNotification extends Notification
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public Evaluation $evaluation)
    {
        $this->evaluation->loadMissing(['portfolio', 'evaluator']);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'evaluation_completed',
            'title' => 'Evaluation Completed',
            'message' => $this->evaluation->evaluator->name.' has completed the evaluation of portfolio "'.$this->evaluation->portfolio->title.'".',
            'portfolio_id' => $this->evaluation->portfolio_id,
            'evaluation_id' => $this->evaluation->id,
            'url' => '/applicant/portfolios/'.$this->evaluation->portfolio_id,
        ];
    }
}
