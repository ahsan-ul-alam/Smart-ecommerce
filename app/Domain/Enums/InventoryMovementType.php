<?php

namespace App\Domain\Enums;

enum InventoryMovementType: string
{
    case In = 'in';
    case Out = 'out';
    case Adjustment = 'adjustment';
    case Damage = 'damage';
    case Restock = 'restock';

    public function label(): string
    {
        return match ($this) {
            self::In => 'Stock In',
            self::Out => 'Stock Out',
            self::Adjustment => 'Adjustment',
            self::Damage => 'Damage',
            self::Restock => 'Restock',
        };
    }
}
