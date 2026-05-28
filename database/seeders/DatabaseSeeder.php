<?php

namespace Database\Seeders;

use App\Services\Integrations\IntegrationManager;
use App\Services\Modules\ModuleService;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            SettingsSeeder::class,
            AdminUserSeeder::class,
            CustomerUserSeeder::class,
            CatalogSeeder::class,
            CommerceSeeder::class,
            CmsSeeder::class,
            ShippingZoneSeeder::class,
            FaqSeeder::class,
            FlashSaleSeeder::class,
            SampleOrdersSeeder::class,
            LoyaltyWalletSeeder::class,
        ]);

        app(ModuleService::class)->syncFromConfig();
        app(IntegrationManager::class)->syncFromConfig();

        // Enable core modules by default
        foreach (['analytics', 'coupon', 'flash_sale', 'loyalty', 'wallet', 'referral', 'affiliate', 'reviews', 'abandoned_cart', 'blog', 'special_product', 'marketing_campaign'] as $module) {
            try {
                app(ModuleService::class)->toggle($module, true);
            } catch (\Throwable) {
                // Module may not exist yet during first run
            }
        }
    }
}
