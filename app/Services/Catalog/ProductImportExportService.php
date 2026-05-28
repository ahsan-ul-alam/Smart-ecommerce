<?php

namespace App\Services\Catalog;

use App\Domain\Enums\ProductStatus;
use App\Domain\Enums\ProductType;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class ProductImportExportService
{
    public function __construct(
        protected ProductRepository $products,
        protected ProductService $productService,
    ) {}

    public function exportHeaders(): array
    {
        return [
            'name',
            'sku',
            'barcode',
            'category',
            'brand',
            'price',
            'compare_price',
            'cost_price',
            'stock_quantity',
            'low_stock_threshold',
            'status',
            'type',
            'is_featured',
            'track_inventory',
            'short_description',
        ];
    }

    public function exportRow(Product $product): array
    {
        return [
            $product->name,
            $product->sku,
            $product->barcode,
            $product->category?->name,
            $product->brand?->name,
            $product->price,
            $product->compare_price,
            $product->cost_price,
            $product->stock_quantity,
            $product->low_stock_threshold,
            $product->status?->value,
            $product->type?->value,
            $product->is_featured ? '1' : '0',
            $product->track_inventory ? '1' : '0',
            $product->short_description,
        ];
    }

    public function import(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        if (! $handle) {
            throw new \RuntimeException('Could not read the uploaded file.');
        }

        $header = fgetcsv($handle);
        if (! $header) {
            fclose($handle);

            return ['created' => 0, 'updated' => 0, 'skipped' => 0, 'errors' => ['File is empty.']];
        }

        $header = array_map(fn ($h) => Str::slug(trim((string) $h), '_'), $header);
        $created = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];
        $line = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $line++;

            if (count(array_filter($row, fn ($v) => trim((string) $v) !== '')) === 0) {
                continue;
            }

            $data = [];
            foreach ($header as $i => $key) {
                $data[$key] = $row[$i] ?? null;
            }

            try {
                $result = $this->importRow($data);
                match ($result) {
                    'created' => $created++,
                    'updated' => $updated++,
                    default => $skipped++,
                };
            } catch (\Throwable $e) {
                $errors[] = "Row {$line}: {$e->getMessage()}";
            }
        }

        fclose($handle);

        return compact('created', 'updated', 'skipped', 'errors');
    }

    protected function importRow(array $data): string
    {
        $name = trim((string) ($data['name'] ?? ''));
        if ($name === '') {
            throw new \InvalidArgumentException('Name is required.');
        }

        $sku = trim((string) ($data['sku'] ?? ''));
        $product = $sku !== ''
            ? Product::query()->where('sku', $sku)->first()
            : null;

        $payload = [
            'name' => $name,
            'barcode' => $data['barcode'] ?? null,
            'category_id' => $this->resolveCategoryId($data['category'] ?? null),
            'brand_id' => $this->resolveBrandId($data['brand'] ?? null),
            'price' => (float) ($data['price'] ?? 0),
            'compare_price' => $this->nullableFloat($data['compare_price'] ?? null),
            'cost_price' => $this->nullableFloat($data['cost_price'] ?? null),
            'stock_quantity' => (int) ($data['stock_quantity'] ?? 0),
            'low_stock_threshold' => (int) ($data['low_stock_threshold'] ?? 5),
            'status' => $this->resolveStatus($data['status'] ?? 'draft'),
            'type' => $this->resolveType($data['type'] ?? 'physical'),
            'is_featured' => $this->toBool($data['is_featured'] ?? '0'),
            'track_inventory' => $this->toBool($data['track_inventory'] ?? '1'),
            'short_description' => $data['short_description'] ?? null,
        ];

        if ($product) {
            if ($sku !== '') {
                $payload['sku'] = $sku;
            }
            $this->productService->update($product, $payload);

            return 'updated';
        }

        if ($sku !== '') {
            $payload['sku'] = $sku;
        }

        $this->productService->create($payload);

        return 'created';
    }

    protected function resolveCategoryId(mixed $value): ?int
    {
        if ($value === null || trim((string) $value) === '') {
            return null;
        }

        if (is_numeric($value)) {
            return Category::query()->whereKey((int) $value)->value('id');
        }

        return Category::query()->firstOrCreate(
            ['slug' => Str::slug((string) $value)],
            ['name' => (string) $value, 'is_active' => true]
        )->id;
    }

    protected function resolveBrandId(mixed $value): ?int
    {
        if ($value === null || trim((string) $value) === '') {
            return null;
        }

        if (is_numeric($value)) {
            return Brand::query()->whereKey((int) $value)->value('id');
        }

        return Brand::query()->firstOrCreate(
            ['slug' => Str::slug((string) $value)],
            ['name' => (string) $value, 'is_active' => true]
        )->id;
    }

    protected function resolveStatus(string $value): ProductStatus
    {
        return ProductStatus::tryFrom(strtolower($value)) ?? ProductStatus::Draft;
    }

    protected function resolveType(string $value): ProductType
    {
        return ProductType::tryFrom(strtolower($value)) ?? ProductType::Physical;
    }

    protected function toBool(mixed $value): bool
    {
        return in_array(strtolower((string) $value), ['1', 'true', 'yes', 'on'], true);
    }

    protected function nullableFloat(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (float) $value;
    }
}
