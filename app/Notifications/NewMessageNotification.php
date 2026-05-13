<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class NewMessageNotification extends Notification
{
    public function __construct(public Message $message)
    {
        $this->message->loadMissing('sender');
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $excerpt = Str::limit($this->message->body, 200);
        $url = url('/messages/'.$this->message->id);

        return (new MailMessage)
            ->subject('New Message: '.$this->message->subject)
            ->greeting('Hello, '.$notifiable->name.'!')
            ->line($this->message->sender->name.' sent you a new message.')
            ->line('**Subject:** '.$this->message->subject)
            ->line($excerpt)
            ->action('View Message', $url);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_message',
            'title' => 'New Message',
            'message' => $this->message->sender->name.' sent you: '.$this->message->subject,
            'message_id' => $this->message->id,
            'url' => '/messages/'.$this->message->id,
        ];
    }
}
