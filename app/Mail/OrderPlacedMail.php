<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderPlacedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Order Confirmed — '.$this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    protected function buildHtml(): string
    {
        $items = $this->order->items->map(fn ($i) => "<li>{$i->product_name} × {$i->quantity} — ৳{$i->total}</li>")->join('');

        return "<h2>Thank you for your order!</h2>
            <p>Order: <strong>{$this->order->order_number}</strong></p>
            <p>Total: <strong>৳{$this->order->total}</strong></p>
            <ul>{$items}</ul>
            <p>ArCommerze — Bangladesh Smart eCommerce</p>";
    }
}
