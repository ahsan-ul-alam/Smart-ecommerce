<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\PageController as AdminPageController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\FlashSaleController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\IntegrationController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductImageController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\ShipmentController;
use App\Http\Controllers\Admin\PosController;
use App\Http\Controllers\Admin\HomepageSectionController;
use App\Http\Controllers\Admin\VendorController;
use App\Http\Controllers\Admin\VendorCommissionController;
use App\Http\Controllers\Admin\AbandonedCartController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SystemController;
use App\Http\Controllers\Admin\NotificationLogController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\Customer\AddressController as CustomerAddressController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\RewardsController;
use App\Http\Controllers\Shop\BlogController as ShopBlogController;
use App\Http\Controllers\Shop\PageController as ShopPageController;
use App\Http\Controllers\Shop\FlashSaleController as ShopFlashSaleController;
use App\Http\Controllers\Shop\CartController;
use App\Http\Controllers\Shop\CheckoutController;
use App\Http\Controllers\Shop\PaymentController;
use App\Http\Controllers\Shop\ProductController as ShopProductController;
use App\Http\Controllers\Shop\VendorController as ShopVendorController;
use App\Http\Controllers\Shop\ReviewController;
use App\Http\Controllers\Shop\WishlistController;
use App\Models\Banner;
use App\Models\HomepageSection;
use App\Models\Product;
use App\Models\Vendor;
use App\Services\Modules\ModuleService;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $featured = Product::query()->published()->where('is_featured', true)->with('images')->limit(12)->get();
    $banners = Banner::query()->where('is_active', true)->where('position', 'homepage')->orderBy('sort_order')->get();

    $flashSales = app(\App\Services\Marketing\FlashSaleService::class)->activeSales();
    $flashProductIds = $flashSales->flatMap(fn ($s) => $s->products->pluck('id'))->unique()->take(8)->all();
    $flashProducts = Product::query()->published()->whereIn('id', $flashProductIds)->with(['images'])->get();
    app(\App\Services\Marketing\FlashSaleService::class)->hydrateCache($flashProducts->pluck('id')->all());

    $sections = HomepageSection::query()->active()->ordered()->get();

    $vendors = app(ModuleService::class)->isEnabled('vendor')
        ? Vendor::query()->where('is_active', true)->has('products')->withCount('products')->orderBy('name')->limit(8)->get(['id', 'name', 'slug', 'logo'])
        : collect();

    $recentlyViewed = \App\Http\Resources\ProductResource::collection(
        app(\App\Services\Commerce\RecentlyViewedService::class)->products(request(), null, 8)
    )->resolve();

    return Inertia::render('Shop/Home', [
        'featured' => \App\Http\Resources\ProductResource::collection($featured)->resolve(),
        'banners' => $banners,
        'sections' => $sections,
        'vendors' => $vendors,
        'flashSale' => $flashSales->first() ? [
            'title' => $flashSales->first()->title,
            'slug' => $flashSales->first()->slug,
            'ends_at' => $flashSales->first()->ends_at->toISOString(),
        ] : null,
        'flashProducts' => \App\Http\Resources\ProductResource::collection($flashProducts)->resolve(),
        'recentlyViewed' => $recentlyViewed,
    ]);
})->name('home');

Route::get('/pages/{slug}', [ShopPageController::class, 'show'])->name('pages.show');

Route::prefix('shop')->name('shop.')->group(function () {
    Route::get('/products', [ShopProductController::class, 'index'])->name('products.index');
    Route::get('/products/{slug}', [ShopProductController::class, 'show'])->name('products.show');
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store'])->middleware('auth')->name('products.reviews');

    Route::get('/faq', [\App\Http\Controllers\Shop\FaqController::class, 'index'])->name('faq');
    Route::get('/flash-sales', [ShopFlashSaleController::class, 'index'])->name('flash-sales.index');
    Route::get('/flash-sales/{slug}', [ShopFlashSaleController::class, 'show'])->name('flash-sales.show');

    Route::middleware('module:vendor')->group(function () {
        Route::get('/vendors/{slug}', [ShopVendorController::class, 'show'])->name('vendors.show');
    });

    Route::middleware('module:blog')->group(function () {
        Route::get('/blog', [ShopBlogController::class, 'index'])->name('blog.index');
        Route::get('/blog/{slug}', [ShopBlogController::class, 'show'])->name('blog.show');
    });

    Route::get('/cart', [CartController::class, 'index'])->name('cart');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{item}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{item}', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::post('/cart/coupon', [CartController::class, 'applyCoupon'])->name('cart.coupon');
    Route::delete('/cart/coupon', [CartController::class, 'removeCoupon'])->name('cart.coupon.remove');

    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
    Route::post('/checkout/shipping-preview', [CheckoutController::class, 'shippingPreview'])->name('checkout.shipping-preview');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('/orders/{orderNumber}/confirmation', [CheckoutController::class, 'confirmation'])->name('orders.confirmation');

    Route::match(['get', 'post'], '/payments/bkash/callback', [PaymentController::class, 'bkashCallback'])->name('payments.bkash.callback');
    Route::get('/payments/bkash/demo', [PaymentController::class, 'bkashDemo'])->name('payments.bkash.demo');

    Route::match(['get', 'post'], '/payments/sslcommerz/{status}', [PaymentController::class, 'sslcommerzCallback'])
        ->where('status', 'success|fail|cancel')
        ->name('payments.sslcommerz.callback');
    Route::get('/payments/sslcommerz/demo', [PaymentController::class, 'sslcommerzDemo'])->name('payments.sslcommerz.demo');
    Route::post('/payments/sslcommerz/ipn', [PaymentController::class, 'sslcommerzIpn'])->name('payments.sslcommerz.ipn');

    Route::match(['get', 'post'], '/payments/nagad/callback', [PaymentController::class, 'nagadCallback'])->name('payments.nagad.callback');
    Route::get('/payments/nagad/demo/{order_id}', [PaymentController::class, 'nagadDemo'])->name('payments.nagad.demo');

    Route::match(['get', 'post'], '/payments/aamarpay/success', [PaymentController::class, 'aamarpaySuccess'])->name('payments.aamarpay.success');
    Route::match(['get', 'post'], '/payments/aamarpay/fail', [PaymentController::class, 'aamarpayFail'])->name('payments.aamarpay.fail');
    Route::match(['get', 'post'], '/payments/aamarpay/cancel', [PaymentController::class, 'aamarpayCancel'])->name('payments.aamarpay.cancel');
    Route::get('/payments/aamarpay/demo', [PaymentController::class, 'aamarpayDemo'])->name('payments.aamarpay.demo');

    Route::get('/payments/stripe/success', [PaymentController::class, 'stripeSuccess'])->name('payments.stripe.success');
    Route::get('/payments/stripe/cancel', [PaymentController::class, 'stripeCancel'])->name('payments.stripe.cancel');
    Route::get('/payments/stripe/demo', [PaymentController::class, 'stripeDemo'])->name('payments.stripe.demo');
    Route::get('/payments/paypal/success', [PaymentController::class, 'paypalSuccess'])->name('payments.paypal.success');
    Route::get('/payments/paypal/cancel', [PaymentController::class, 'paypalCancel'])->name('payments.paypal.cancel');
    Route::get('/payments/paypal/demo', [PaymentController::class, 'paypalDemo'])->name('payments.paypal.demo');
});

Route::middleware('auth')->group(function () {
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
    Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])->name('oauth.redirect');
    Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])->name('oauth.callback');
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

Route::prefix('account')->middleware(['auth'])->name('account.')->group(function () {
    Route::get('/', [CustomerDashboardController::class, 'index'])->name('dashboard');
    Route::get('/orders', [CustomerOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [CustomerOrderController::class, 'show'])->name('orders.show');
    Route::get('/orders/{order}/invoice', [CustomerOrderController::class, 'invoice'])->name('orders.invoice');
    Route::post('/orders/{order}/return', [CustomerOrderController::class, 'requestReturn'])->name('orders.return');
    Route::get('/rewards', [RewardsController::class, 'index'])->name('rewards');
    Route::get('/addresses', [CustomerAddressController::class, 'index'])->name('addresses.index');
    Route::post('/addresses', [CustomerAddressController::class, 'store'])->name('addresses.store');
    Route::put('/addresses/{address}', [CustomerAddressController::class, 'update'])->name('addresses.update');
    Route::delete('/addresses/{address}', [CustomerAddressController::class, 'destroy'])->name('addresses.destroy');
});

Route::prefix('admin')->middleware(['auth', 'admin'])->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');

    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('customers/export', [CustomerController::class, 'export'])->name('customers.export');
    Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    Route::patch('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::post('customers/{customer}/wallet', [CustomerController::class, 'creditWallet'])->name('customers.wallet');
    Route::post('customers/{customer}/loyalty', [CustomerController::class, 'adjustLoyalty'])->name('customers.loyalty');
    Route::patch('customers/{customer}/affiliate', [\App\Http\Controllers\Admin\AffiliateController::class, 'toggleAffiliate'])->name('customers.affiliate');

    Route::get('affiliates', [\App\Http\Controllers\Admin\AffiliateController::class, 'index'])->name('affiliates.index');
    Route::patch('affiliates/commissions/{commission}', [\App\Http\Controllers\Admin\AffiliateController::class, 'markPaid'])->name('affiliates.commissions.paid');

    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/export', [OrderController::class, 'export'])->name('orders.export');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::get('orders/{order}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');
    Route::get('orders/{order}/packing-slip', [OrderController::class, 'packingSlip'])->name('orders.packing-slip');
    Route::get('return-requests', [\App\Http\Controllers\Admin\ReturnRequestController::class, 'index'])->name('return-requests.index');
    Route::patch('return-requests/{returnRequest}', [\App\Http\Controllers\Admin\ReturnRequestController::class, 'update'])->name('return-requests.update');
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::patch('orders/{order}/payment', [OrderController::class, 'updatePayment'])->name('orders.payment');
    Route::patch('orders/{order}/note', [OrderController::class, 'updateNote'])->name('orders.note');
    Route::post('orders/{order}/shipment', [ShipmentController::class, 'store'])->name('orders.shipment');

    Route::get('products/export', [ProductController::class, 'export'])->name('products.export');
    Route::get('products/import/template', [ProductController::class, 'importTemplate'])->name('products.import.template');
    Route::get('products/import', [ProductController::class, 'importForm'])->name('products.import');
    Route::post('products/import', [ProductController::class, 'import'])->name('products.import.store');

    Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update');

    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::resource('products', ProductController::class)->except(['show']);
    Route::post('products/{product}/duplicate', [ProductController::class, 'duplicate'])->name('products.duplicate');
    Route::post('products/{product}/images', [ProductImageController::class, 'store'])->name('products.images.store');
    Route::delete('products/{product}/images/{image}', [ProductImageController::class, 'destroy'])->name('products.images.destroy');
    Route::patch('products/{product}/images/{image}/primary', [ProductImageController::class, 'setPrimary'])->name('products.images.primary');
    Route::post('products/{product}/inventory', [ProductController::class, 'adjustInventory'])->name('products.inventory');
    Route::post('products/{product}/variants', [ProductController::class, 'syncVariants'])->name('products.variants');

    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('inventory/alert', [InventoryController::class, 'sendLowStockAlert'])->name('inventory.alert');
    Route::post('inventory/{product}/restock', [InventoryController::class, 'restock'])->name('inventory.restock');

    Route::get('notification-logs', [NotificationLogController::class, 'index'])->name('notification-logs.index');

    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('coupons', [CouponController::class, 'index'])->name('coupons.index');
    Route::get('flash-sales', [FlashSaleController::class, 'index'])->name('flash-sales.index');
    Route::post('flash-sales', [FlashSaleController::class, 'store'])->name('flash-sales.store');
    Route::put('flash-sales/{flashSale}', [FlashSaleController::class, 'update'])->name('flash-sales.update');
    Route::delete('flash-sales/{flashSale}', [FlashSaleController::class, 'destroy'])->name('flash-sales.destroy');
    Route::post('coupons', [CouponController::class, 'store'])->name('coupons.store');
    Route::put('coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');
    Route::delete('coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');

    Route::get('reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
    Route::patch('reviews/{review}/approve', [AdminReviewController::class, 'approve'])->name('reviews.approve');
    Route::delete('reviews/{review}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');

    Route::get('cms/banners', [BannerController::class, 'index'])->name('cms.banners');
    Route::post('cms/banners', [BannerController::class, 'store'])->name('cms.banners.store');
    Route::put('cms/banners/{banner}', [BannerController::class, 'update'])->name('cms.banners.update');
    Route::delete('cms/banners/{banner}', [BannerController::class, 'destroy'])->name('cms.banners.destroy');

    Route::middleware('module:blog')->group(function () {
        Route::get('cms/blog', [BlogController::class, 'index'])->name('cms.blog');
        Route::post('cms/blog', [BlogController::class, 'store'])->name('cms.blog.store');
        Route::delete('cms/blog/{post}', [BlogController::class, 'destroy'])->name('cms.blog.destroy');
    });

    Route::get('cms/homepage', [HomepageSectionController::class, 'index'])->name('cms.homepage');
    Route::post('cms/homepage', [HomepageSectionController::class, 'store'])->name('cms.homepage.store');
    Route::put('cms/homepage/{section}', [HomepageSectionController::class, 'update'])->name('cms.homepage.update');
    Route::delete('cms/homepage/{section}', [HomepageSectionController::class, 'destroy'])->name('cms.homepage.destroy');
    Route::patch('cms/homepage/reorder', [HomepageSectionController::class, 'reorder'])->name('cms.homepage.reorder');

    Route::get('cms/pages', [AdminPageController::class, 'index'])->name('cms.pages');
    Route::get('cms/faqs', [\App\Http\Controllers\Admin\FaqController::class, 'index'])->name('cms.faqs');
    Route::post('cms/faqs', [\App\Http\Controllers\Admin\FaqController::class, 'store'])->name('cms.faqs.store');
    Route::put('cms/faqs/{faq}', [\App\Http\Controllers\Admin\FaqController::class, 'update'])->name('cms.faqs.update');
    Route::delete('cms/faqs/{faq}', [\App\Http\Controllers\Admin\FaqController::class, 'destroy'])->name('cms.faqs.destroy');
    Route::post('cms/pages', [AdminPageController::class, 'store'])->name('cms.pages.store');
    Route::put('cms/pages/{page}', [AdminPageController::class, 'update'])->name('cms.pages.update');
    Route::delete('cms/pages/{page}', [AdminPageController::class, 'destroy'])->name('cms.pages.destroy');

    Route::get('brands', [BrandController::class, 'index'])->name('brands.index');
    Route::post('brands', [BrandController::class, 'store'])->name('brands.store');
    Route::put('brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
    Route::delete('brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');

    Route::get('staff', [\App\Http\Controllers\Admin\StaffController::class, 'index'])->name('staff.index');
    Route::post('staff', [\App\Http\Controllers\Admin\StaffController::class, 'store'])->name('staff.store');
    Route::put('staff/{user}', [\App\Http\Controllers\Admin\StaffController::class, 'update'])->name('staff.update');
    Route::delete('staff/{user}', [\App\Http\Controllers\Admin\StaffController::class, 'destroy'])->name('staff.destroy');

    Route::get('shipping-zones', [\App\Http\Controllers\Admin\ShippingZoneController::class, 'index'])->name('shipping-zones.index');
    Route::post('shipping-zones', [\App\Http\Controllers\Admin\ShippingZoneController::class, 'store'])->name('shipping-zones.store');
    Route::put('shipping-zones/{shippingZone}', [\App\Http\Controllers\Admin\ShippingZoneController::class, 'update'])->name('shipping-zones.update');
    Route::delete('shipping-zones/{shippingZone}', [\App\Http\Controllers\Admin\ShippingZoneController::class, 'destroy'])->name('shipping-zones.destroy');

    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/general', [SettingsController::class, 'general'])->name('general');
        Route::put('/general', [SettingsController::class, 'updateGeneral'])->name('general.update');
        Route::get('/notifications', [SettingsController::class, 'notifications'])->name('notifications');
        Route::put('/notifications', [SettingsController::class, 'updateNotifications'])->name('notifications.update');
        Route::get('/theme', [SettingsController::class, 'theme'])->name('theme');
        Route::put('/theme', [SettingsController::class, 'updateTheme'])->name('theme.update');
        Route::get('/commerce', [SettingsController::class, 'commerce'])->name('commerce');
        Route::put('/commerce', [SettingsController::class, 'updateCommerce'])->name('commerce.update');
        Route::get('/modules', [SettingsController::class, 'modules'])->name('modules');
        Route::patch('/modules/{key}', [SettingsController::class, 'toggleModule'])->name('modules.toggle');
        Route::get('/system', [SystemController::class, 'index'])->name('system');
        Route::post('/system/clear', [SystemController::class, 'clear'])->name('system.clear');
        Route::get('/integrations/{type}', [SettingsController::class, 'integrations'])->name('integrations');
    });

    Route::patch('integrations/{integration}', [IntegrationController::class, 'update'])->name('integrations.update');

    Route::middleware('module:pos')->prefix('pos')->name('pos.')->group(function () {
        Route::get('/', [PosController::class, 'index'])->name('index');
        Route::get('/search', [PosController::class, 'search'])->name('search');
        Route::post('/', [PosController::class, 'store'])->name('store');
        Route::get('/receipt/{order}', [PosController::class, 'receipt'])->name('receipt');
    });

    Route::middleware('module:abandoned_cart')->group(function () {
        Route::get('abandoned-carts', [AbandonedCartController::class, 'index'])->name('abandoned-carts.index');
        Route::post('abandoned-carts/{cart}/remind', [AbandonedCartController::class, 'remind'])->name('abandoned-carts.remind');
    });

    Route::middleware('module:vendor')->group(function () {
        Route::get('vendors/commissions', [VendorCommissionController::class, 'index'])->name('vendors.commissions');
        Route::patch('vendors/commissions/{commission}', [VendorCommissionController::class, 'markPaid'])->name('vendors.commissions.paid');
        Route::get('vendors', [VendorController::class, 'index'])->name('vendors.index');
        Route::post('vendors', [VendorController::class, 'store'])->name('vendors.store');
        Route::put('vendors/{vendor}', [VendorController::class, 'update'])->name('vendors.update');
        Route::delete('vendors/{vendor}', [VendorController::class, 'destroy'])->name('vendors.destroy');
    });
});
