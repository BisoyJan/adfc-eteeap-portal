<?php

namespace App\Notifications;

use App\Models\Portfolio;
use Illuminate\Notifications\Notification;

class PortfolioStatusChangedNotification extends Notification
{
    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Portfolio $portfolio,
        public string $oldStatus,
    ) {}

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
            'type' => 'portfolio_status_changed',
            'title' => 'Portfolio Status Updated',
            'message' => 'Your portfolio "'.$this->portfolio->title.'" status has been updated to '.$this->portfolio->status->label().'.',
            'portfolio_id' => $this->portfolio->id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->portfolio->status->value,
            'url' => '/applicant/portfolios/'.$this->portfolio->id,
        ];
    }
}
