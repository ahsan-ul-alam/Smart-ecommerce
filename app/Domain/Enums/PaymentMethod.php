<?php

namespace App\Domain\Enums;

enum PaymentMethod: string
{
    case Cod = 'cod';
    case Bkash = 'bkash';
    case Nagad = 'nagad';
    case Sslcommerz = 'sslcommerz';
    case Aamarpay = 'aamarpay';
    case Stripe = 'stripe';
    case Paypal = 'paypal';

    public function label(): string
    {
        return match ($this) {
            self::Cod => 'Cash on Delivery',
            self::Bkash => 'bKash',
            self::Nagad => 'Nagad',
            self::Sslcommerz => 'SSLCommerz',
            self::Aamarpay => 'aamarPay',
            self::Stripe => 'Stripe',
            self::Paypal => 'PayPal',
        };
    }
}
