<?php

namespace App\Services\System;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Redis;

class QueueMonitorService
{
    public function stats(): array
    {
        $connection = config('queue.default');
        $driver = config("queue.connections.{$connection}.driver");

        $pending = 0;
        $failed = 0;

        if ($driver === 'database') {
            $pending = (int) DB::table('jobs')->count();
            $failed = (int) DB::table('failed_jobs')->count();
        } elseif ($driver === 'redis') {
            try {
                $redis = Redis::connection(config("queue.connections.{$connection}.connection", 'default'));
                $pending = (int) $redis->llen('queues:default');
                $failed = (int) $redis->llen('queues:default:failed');
            } catch (\Throwable) {
                $pending = -1;
            }
        }

        return [
            'connection' => $connection,
            'driver' => $driver,
            'pending_jobs' => $pending,
            'failed_jobs' => $failed,
            'horizon_available' => extension_loaded('pcntl'),
            'redis_recommended' => true,
        ];
    }
}
