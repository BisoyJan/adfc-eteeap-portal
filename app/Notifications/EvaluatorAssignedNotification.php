<?php

namespace App\Notifications;

use App\Models\PortfolioAssignment;
use Illuminate\Notifications\Notification;

class EvaluatorAssignedNotification extends Notification
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public PortfolioAssignment $assignment)
    {
        $this->assignment->loadMissing('portfolio.user');
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
            'type' => 'evaluator_assigned',
            'title' => 'New Portfolio Assignment',
            'message' => 'You have been assigned to evaluate the portfolio "'.$this->assignment->portfolio->title.'" by '.$this->assignment->portfolio->user->name.'.',
            'portfolio_id' => $this->assignment->portfolio_id,
            'assignment_id' => $this->assignment->id,
            'url' => '/evaluator/portfolios/'.$this->assignment->id,
        ];
    }
}
