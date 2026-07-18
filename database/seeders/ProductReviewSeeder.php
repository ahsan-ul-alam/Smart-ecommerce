<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Database\Seeder;

/**
 * Gives every product a handful of approved reviews so ratings, star counts and the
 * reviews section render realistically. Idempotent: only tops products up to the target,
 * with deterministic content, so re-running never duplicates.
 */
class ProductReviewSeeder extends Seeder
{
    private const NAMES = [
        'Rahim Uddin', 'Ayesha Siddika', 'Karim Hossain', 'Nusrat Jahan', 'Sabbir Ahmed',
        'Fatima Akter', 'Tanvir Islam', 'Mitu Rahman', 'Jamal Uddin', 'Sadia Islam',
        'Rafiqul Islam', 'Shakib Hasan', 'Tania Sultana', 'Imran Khan', 'Farhana Yasmin',
    ];

    private const COMMENTS = [
        5 => [
            'Excellent quality, highly recommended!',
            'Exactly as described and delivery was fast.',
            'Loved it. Will definitely order again.',
            'Superb product, worth every taka.',
            'Great packaging and top-notch quality.',
        ],
        4 => [
            'Good product, works well for the price.',
            'Happy with the purchase overall.',
            'Nice quality, delivery was on time.',
            'Solid value for money, would recommend.',
        ],
        3 => [
            'It is okay, does the job.',
            'Average product, nothing special but usable.',
        ],
    ];

    public function run(): void
    {
        // Weighted toward positive ratings, deterministic per slot.
        $ratingCycle = [5, 5, 4, 5, 4, 3, 5, 4];

        Product::query()->orderBy('id')->get()->each(function (Product $product) use ($ratingCycle) {
            $existing = $product->reviews()->count();
            $target = 3 + ($product->id % 3); // 3–5 reviews

            for ($k = $existing; $k < $target; $k++) {
                $seed = $product->id * 7 + $k;
                $rating = $ratingCycle[$seed % count($ratingCycle)];
                $comments = self::COMMENTS[$rating];

                ProductReview::query()->create([
                    'product_id' => $product->id,
                    'user_id' => null,
                    'guest_name' => self::NAMES[$seed % count(self::NAMES)],
                    'rating' => $rating,
                    'comment' => $comments[$seed % count($comments)],
                    'is_approved' => true,
                ]);
            }
        });
    }
}
