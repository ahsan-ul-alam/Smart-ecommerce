<?php

namespace App\Services\Notifications;

use App\Domain\Enums\IntegrationType;
use App\Mail\OrderPlacedMail;
use App\Models\NotificationLog;
use App\Models\Order;
use Illuminate\Support\Collection;
use App\Services\Integrations\IntegrationManager;
use App\Services\Modules\ModuleService;
use App\Services\Settings\SettingService;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function __construct(
        protected SettingService $settings,
        protected ModuleService $modules,
        protected IntegrationManager $integrations,
    ) {}

    public function orderPlaced(Order $order): void
    {
        $order->load('items');
        $phone = $order->guest_phone ?? $order->shipping_address['phone'] ?? null;
        $email = $order->guest_email ?? $order->user?->email;

        if ($this->settings->get('notifications', 'email_order_confirmation', true) && $email) {
            $this->sendEmail(
                $email,
                'Order '.$order->order_number.' confirmed',
                (new OrderPlacedMail($order))->render(),
                $order,
                'order_placed'
            );
        }

        if ($this->settings->get('notifications', 'sms_order_confirmation', true) && $phone) {
            $this->sendSms($phone, "Order {$order->order_number} placed. Total: {$order->total} BDT. Thank you!", $order, 'order_placed');
        }
    }

    public function lowStockAlert(Collection $products): void
    {
        $email = $this->settings->get('general', 'store_email')
            ?: config('mail.from.address');

        if (! $email) {
            return;
        }

        $lines = $products->map(fn ($p) => sprintf(
            '%s (SKU %s): %d left (threshold %d)',
            $p->name,
            $p->sku,
            $p->stock_quantity,
            $p->low_stock_threshold
        ))->implode('<br>');

        $url = url('/admin/inventory');
        $html = "<p><strong>{$products->count()} product(s)</strong> are low on stock:</p><p>{$lines}</p><p><a href=\"{$url}\">View inventory</a></p>";

        $this->sendEmail($email, 'Low stock alert — '.config('arcommerze.name'), $html, null, 'low_stock');
    }

    public function abandonedCartReminder(string $phone, ?string $email, string $cartUrl): void
    {
        if (! $this->modules->isEnabled('abandoned_cart')) {
            return;
        }

        if ($this->settings->get('notifications', 'abandoned_cart_email', true) && $email) {
            $this->sendEmail(
                $email,
                'Complete your order',
                "<p>You left items in your cart. <a href=\"{$cartUrl}\">Complete checkout</a></p>",
                null,
                'abandoned_cart'
            );
        }

        if ($this->settings->get('notifications', 'abandoned_cart_sms', false) && $phone) {
            $this->sendSms($phone, "Complete your ArCommerze order: {$cartUrl}", null, 'abandoned_cart');
        }
    }

    protected function sendEmail(string $to, string $subject, string $html, $notifiable, string $event): void
    {
        try {
            $integration = $this->integrations->getEnabled(IntegrationType::Email)->first();

            if ($integration) {
                $driver = $this->integrations->resolveEmail($integration->provider);
                $result = $driver->send(['to' => $to, 'subject' => $subject, 'html' => $html]);
                $status = ($result['success'] ?? false) ? 'sent' : 'failed';
                $this->log('email', $event, $to, $notifiable, $status, $result['message'] ?? null);

                return;
            }

            Mail::html($html, fn ($message) => $message->to($to)->subject($subject));
            $this->log('email', $event, $to, $notifiable, 'sent');
        } catch (\Throwable $e) {
            $this->log('email', $event, $to, $notifiable, 'failed', $e->getMessage());
        }
    }

    protected function sendSms(string $phone, string $message, $notifiable, string $event): void
    {
        try {
            $provider = $this->integrations->getEnabled(IntegrationType::Sms)->first();
            if (! $provider) {
                $this->log('sms', $event, $phone, $notifiable, 'skipped', 'No SMS provider enabled');

                return;
            }
            $driver = $this->integrations->resolveSms($provider->provider);
            $result = $driver->send($phone, $message);
            $this->log('sms', $event, $phone, $notifiable, ($result['success'] ?? false) ? 'sent' : 'failed', $message);
        } catch (\Throwable $e) {
            $this->log('sms', $event, $phone, $notifiable, 'failed', $e->getMessage());
        }
    }

    protected function log(string $channel, string $event, string $recipient, $notifiable, string $status, ?string $message = null): void
    {
        NotificationLog::query()->create([
            'channel' => $channel,
            'event' => $event,
            'recipient' => $recipient,
            'status' => $status,
            'message' => $message,
            'notifiable_type' => $notifiable ? $notifiable::class : null,
            'notifiable_id' => $notifiable?->id,
        ]);
    }
}
