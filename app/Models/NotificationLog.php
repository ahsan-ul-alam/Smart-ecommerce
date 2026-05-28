<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $fillable = [
        'channel', 'event', 'recipient', 'status', 'message',
        'notifiable_type', 'notifiable_id', 'meta',
    ];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }
}
