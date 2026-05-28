<?php

namespace App\Domain\Enums;

enum CampaignType: string
{
    case Popup = 'popup';
    case ScheduledDiscount = 'scheduled_discount';
}
