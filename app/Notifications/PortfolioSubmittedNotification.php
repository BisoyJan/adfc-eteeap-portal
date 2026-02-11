<?php

namespace App\Notifications;

use App\Models\Portfolio;
use Illuminate\Notifications\Notification;

class PortfolioSubmittedNotification extends Notification
{
    /**
     * Create a new notification instance.
     */
    public function __construct(public Portfolio $portfolio) {}

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
            'type' => 'portfolio_submitted',
            'title' => 'New Portfolio Submitted',
            'message' => $this->portfolio->user->name.' submitted their portfolio "'.$this->portfolio->title.'" for review.',
            'portfolio_id' => $this->portfolio->id,
            'user_id' => $this->portfolio->user_id,
            'url' => '/admin/portfolios/'.$this->portfolio->id,
        ];
    }
}
