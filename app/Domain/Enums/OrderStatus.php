<?php

namespace App\Domain\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Processing = 'processing';
    case Packed = 'packed';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Returned = 'returned';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Confirmed => 'Confirmed',
            self::Processing => 'Processing',
            self::Packed => 'Packed',
            self::Shipped => 'Shipped',
            self::Delivered => 'Delivered',
            self::Cancelled => 'Cancelled',
            self::Returned => 'Returned',
            self::Refunded => 'Refunded',
        };
    }

    /** @return list<self> */
    public static function workflowSteps(): array
    {
        return [
            self::Pending,
            self::Confirmed,
            self::Processing,
            self::Packed,
            self::Shipped,
            self::Delivered,
        ];
    }

    public function defaultNext(): ?self
    {
        return match ($this) {
            self::Pending => self::Confirmed,
            self::Confirmed => self::Processing,
            self::Processing => self::Packed,
            self::Packed => self::Shipped,
            self::Shipped => self::Delivered,
            default => null,
        };
    }

    /** @return list<self> */
    public function nextStatuses(): array
    {
        return match ($this) {
            self::Pending => [self::Confirmed, self::Cancelled],
            self::Confirmed => [self::Processing, self::Cancelled],
            self::Processing => [self::Packed, self::Cancelled],
            self::Packed => [self::Shipped, self::Cancelled],
            self::Shipped => [self::Delivered, self::Returned],
            self::Delivered => [self::Returned, self::Refunded],
            self::Returned => [self::Refunded],
            self::Cancelled, self::Refunded => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->nextStatuses(), true);
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Cancelled, self::Refunded], true);
    }

    public function isWorkflowStep(): bool
    {
        return in_array($this, self::workflowSteps(), true);
    }
}
