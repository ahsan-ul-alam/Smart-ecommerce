<?php

namespace App\Services\Marketing;

use App\Models\NewsletterSubscriber;

class NewsletterService
{
    public function subscribe(string $email, string $source = 'footer'): NewsletterSubscriber
    {
        $email = strtolower(trim($email));

        $existing = NewsletterSubscriber::query()->where('email', $email)->first();

        if ($existing) {
            if ($existing->unsubscribed_at) {
                $existing->update([
                    'unsubscribed_at' => null,
                    'subscribed_at' => now(),
                    'source' => $source,
                ]);
            }

            return $existing->fresh();
        }

        return NewsletterSubscriber::query()->create([
            'email' => $email,
            'source' => $source,
            'subscribed_at' => now(),
        ]);
    }

    public function unsubscribe(string $email): bool
    {
        $subscriber = NewsletterSubscriber::query()->where('email', strtolower(trim($email)))->first();

        if (! $subscriber || $subscriber->unsubscribed_at) {
            return false;
        }

        $subscriber->update(['unsubscribed_at' => now()]);

        return true;
    }
}
