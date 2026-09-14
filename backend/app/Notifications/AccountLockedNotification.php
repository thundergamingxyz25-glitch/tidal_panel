<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountLockedNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('TidePanel account locked')
            ->line('Your TidePanel account was locked after five failed login attempts.')
            ->line('The lock expires automatically after 15 minutes. If this was not you, reset your password and revoke active sessions.');
    }
}
