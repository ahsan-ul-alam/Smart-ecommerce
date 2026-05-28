<?php

namespace App\Domain\Enums;

enum IntegrationType: string
{
    case Payment = 'payment';
    case Courier = 'courier';
    case Sms = 'sms';
    case Email = 'email';
}
