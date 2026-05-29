<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\PageController as AdminPageController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\FlashSaleController;
use App\Http\Controllers\Admin\MarketingCampaignController;
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
use App\Http\Controllers\Admin\TeamController;
use App\Http\Controllers\Admin\SystemController;
use App\Http\Controllers\Admin\NotificationLogController;
use App\Http\Controllers\Admin\AlertController;
use App\Http\Controllers\Admin\PaymentTransactionController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Webhooks\CourierWebhookController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\OtpController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\Customer\AddressController as CustomerAddressController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\RewardsController;
use App\Http\Controllers\Shop\BlogController as ShopBlogController;
use App\Http\Controllers\Shop\PageController as ShopPageController;
use App\Http\Controllers\Shop\FlashSaleController as ShopFlashSaleController;
use App\Http\Controllers\Shop\CampaignController;
use App\Http\Controllers\Shop\CartController;
use App\Http\Controllers\Shop\CheckoutController;
use App\Http\Controllers\Shop\PaymentController;
use App\Http\Controllers\Shop\ProductController as ShopProductController;
use App\Http\Controllers\Shop\VendorController as ShopVendorController;
use App\Http\Controllers\Shop\ReviewController;
use App\Http\Controllers\Shop\WishlistController;
use App\Http\Controllers\Shop\NewsletterController as ShopNewsletterController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\Admin\NewsletterController;
use App\Http\Controllers\Admin\ContactInquiryController;
use App\Http\Controllers\Shop\ContactController as ShopContactController;
use App\Http\Controllers\Shop\HomeController;
use App\Http\Controllers\Shop\LocationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::post('/locale', [\App\Http\Controllers\LocaleController::class, 'update'])->name('locale.update');

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');

Route::post('/newsletter/subscribe', [ShopNewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
Route::get('/newsletter/unsubscribe', [ShopNewsletterController::class, 'unsubscribeForm'])->name('newsletter.unsubscribe');
Route::post('/newsletter/unsubscribe', [ShopNewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe.store');

Route::get('/pages/{slug}', [ShopPageController::class, 'show'])->name('pages.show');
Route::middleware('module:special_product')->group(function () {
    Route::get('/offer/{slug}', [\App\Http\Controllers\Shop\SpecialProductController::class, 'show'])->name('offer.show');
    Route::post('/offer/{slug}/shipping-preview', [\App\Http\Controllers\Shop\SpecialProductCheckoutController::class, 'shippingPreview'])->name('offer.shipping-preview');
    Route::post('/offer/{slug}/checkout', [\App\Http\Controllers\Shop\SpecialProductCheckoutController::class, 'store'])->name('offer.checkout');
    Route::get('/offer/{slug}/orders/{orderNumber}/{status}', [\App\Http\Controllers\Shop\SpecialProductCheckoutController::class, 'result'])
        ->whereIn('status', ['success', 'failed'])
        ->name('offer.order.result');
});

Route::prefix('shop')->name('shop.')->group(function () {
    Route::get('/products', [ShopProductController::class, 'index'])->name('products.index');
    Route::get('/products/{slug}', [ShopProductController::class, 'show'])->name('products.show');
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store'])
        ->middleware(['auth', 'module:reviews'])
        ->name('products.reviews');

    Route::get('/contact', [ShopContactController::class, 'index'])->name('contact');
    Route::post('/contact', [ShopContactController::class, 'store'])->name('contact.store');

    Route::get('/locations/divisions', [LocationController::class, 'divisions'])->name('locations.divisions');
    Route::get('/locations/districts', [LocationController::class, 'districts'])->name('locations.districts');
    Route::get('/locations/thanas', [LocationController::class, 'thanas'])->name('locations.thanas');

    Route::get('/faq', [\App\Http\Controllers\Shop\FaqController::class, 'index'])->name('faq');
    Route::middleware('module:flash_sale')->group(function () {
        Route::get('/flash-sales', [ShopFlashSaleController::class, 'index'])->name('flash-sales.index');
        Route::get('/flash-sales/{slug}', [ShopFlashSaleController::class, 'show'])->name('flash-sales.show');
    });

    Route::middleware('module:vendor')->group(function () {
        Route::get('/vendors/{slug}', [ShopVendorController::class, 'show'])->name('vendors.show');
    });

    Route::middleware('module:blog')->group(function () {
        Route::get('/blog', [ShopBlogController::class, 'index'])->name('blog.index');
        Route::get('/blog/{slug}', [ShopBlogController::class, 'show'])->name('blog.show');
    });

    Route::get('/cart/drawer', [CartController::class, 'drawer'])->name('cart.drawer');
    Route::get('/cart', [CartController::class, 'index'])->name('cart');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{item}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{item}', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::middleware('module:coupon')->group(function () {
        Route::post('/cart/coupon', [CartController::class, 'applyCoupon'])->name('cart.coupon');
        Route::delete('/cart/coupon', [CartController::class, 'removeCoupon'])->name('cart.coupon.remove');
    });

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
    Route::post('/otp/send', [OtpController::class, 'send'])->middleware('throttle:5,1')->name('otp.send');
    Route::post('/otp/login', [OtpController::class, 'login'])->middleware('throttle:10,1')->name('otp.login');
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
    Route::get('/forgot-password', [ForgotPasswordController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [ForgotPasswordController::class, 'store'])->name('password.email');
    Route::get('/reset-password/{token}', [ResetPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [ResetPasswordController::class, 'store'])->name('password.update');
    Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])->name('oauth.redirect');
    Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])->name('oauth.callback');
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/email/verify', [EmailVerificationController::class, 'notice'])->name('verification.notice');
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'send'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
});

Route::post('/webhooks/courier/{provider}', [CourierWebhookController::class, 'handle'])
    ->name('webhooks.courier');

Route::prefix('account')->middleware(['auth', 'verified'])->name('account.')->group(function () {
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
    Route::get('alerts', [AlertController::class, 'index'])->name('alerts.index');
    Route::middleware('module:analytics')->group(function () {
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    });

    Route::get('contact-inquiries', [ContactInquiryController::class, 'index'])->name('contact-inquiries.index');
    Route::patch('contact-inquiries/{inquiry}', [ContactInquiryController::class, 'update'])->name('contact-inquiries.update');
    Route::delete('contact-inquiries/{inquiry}', [ContactInquiryController::class, 'destroy'])->name('contact-inquiries.destroy');

    Route::get('newsletter', [NewsletterController::class, 'index'])->name('newsletter.index');
    Route::get('newsletter/export', [NewsletterController::class, 'export'])->name('newsletter.export');
    Route::delete('newsletter/{subscriber}', [NewsletterController::class, 'destroy'])->name('newsletter.destroy');

    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('customers/export', [CustomerController::class, 'export'])->name('customers.export');
    Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    Route::patch('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::post('customers/{customer}/wallet', [CustomerController::class, 'creditWallet'])->name('customers.wallet');
    Route::post('customers/{customer}/loyalty', [CustomerController::class, 'adjustLoyalty'])->name('customers.loyalty');
    Route::patch('customers/{customer}/affiliate', [\App\Http\Controllers\Admin\AffiliateController::class, 'toggleAffiliate'])->name('customers.affiliate');

    Route::middleware('module:affiliate')->group(function () {
        Route::get('affiliates', [\App\Http\Controllers\Admin\AffiliateController::class, 'index'])->name('affiliates.index');
        Route::patch('affiliates/commissions/{commission}', [\App\Http\Controllers\Admin\AffiliateController::class, 'markPaid'])->name('affiliates.commissions.paid');
    });

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
    Route::post('orders/{order}/shipment/sync', [ShipmentController::class, 'sync'])->name('orders.shipment.sync');

    Route::get('products/export', [ProductController::class, 'export'])->name('products.export');
    Route::get('products/import/template', [ProductController::class, 'importTemplate'])->name('products.import.template');
    Route::get('products/import', [ProductController::class, 'importForm'])->name('products.import');
    Route::post('products/import', [ProductController::class, 'import'])->name('products.import.store');
    Route::post('products/bulk', [ProductController::class, 'bulk'])->name('products.bulk');

    Route::get('team', [TeamController::class, 'index'])->name('team.index');
    Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
    Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::put('roles/{role}/members', [RoleController::class, 'syncMembers'])->name('roles.members.sync');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

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
    Route::get('payment-transactions', [PaymentTransactionController::class, 'index'])->name('payment-transactions.index');

    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::middleware('module:special_product')->group(function () {
        Route::get('special-products', [\App\Http\Controllers\Admin\SpecialProductController::class, 'index'])->name('special-products.index');
        Route::post('special-products', [\App\Http\Controllers\Admin\SpecialProductController::class, 'store'])->name('special-products.store');
        Route::get('special-products/{specialProduct}/edit', [\App\Http\Controllers\Admin\SpecialProductController::class, 'edit'])->name('special-products.edit');
        Route::put('special-products/{specialProduct}', [\App\Http\Controllers\Admin\SpecialProductController::class, 'update'])->name('special-products.update');
        Route::patch('special-products/{specialProduct}/autosave', [\App\Http\Controllers\Admin\SpecialProductController::class, 'autosave'])->name('special-products.autosave');
        Route::get('special-products/{specialProduct}/versions', [\App\Http\Controllers\Admin\SpecialProductController::class, 'versions'])->name('special-products.versions');
        Route::post('special-products/{specialProduct}/versions/{version}/restore', [\App\Http\Controllers\Admin\SpecialProductController::class, 'restoreVersion'])->name('special-products.versions.restore');
        Route::delete('special-products/{specialProduct}', [\App\Http\Controllers\Admin\SpecialProductController::class, 'destroy'])->name('special-products.destroy');
    });

    Route::middleware('module:coupon')->group(function () {
        Route::get('coupons', [CouponController::class, 'index'])->name('coupons.index');
        Route::post('coupons', [CouponController::class, 'store'])->name('coupons.store');
        Route::put('coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');
        Route::delete('coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');
    });

    Route::middleware('module:marketing_campaign')->group(function () {
        Route::get('marketing-campaigns', [MarketingCampaignController::class, 'index'])->name('marketing-campaigns.index');
        Route::post('marketing-campaigns', [MarketingCampaignController::class, 'store'])->name('marketing-campaigns.store');
        Route::put('marketing-campaigns/{marketingCampaign}', [MarketingCampaignController::class, 'update'])->name('marketing-campaigns.update');
        Route::delete('marketing-campaigns/{marketingCampaign}', [MarketingCampaignController::class, 'destroy'])->name('marketing-campaigns.destroy');
    });

    Route::middleware('module:flash_sale')->group(function () {
        Route::get('flash-sales', [FlashSaleController::class, 'index'])->name('flash-sales.index');
        Route::post('flash-sales', [FlashSaleController::class, 'store'])->name('flash-sales.store');
        Route::put('flash-sales/{flashSale}', [FlashSaleController::class, 'update'])->name('flash-sales.update');
        Route::delete('flash-sales/{flashSale}', [FlashSaleController::class, 'destroy'])->name('flash-sales.destroy');
    });

    Route::middleware('module:reviews')->group(function () {
        Route::get('reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
        Route::patch('reviews/{review}/approve', [AdminReviewController::class, 'approve'])->name('reviews.approve');
        Route::delete('reviews/{review}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');
    });

    Route::get('cms/banners', [BannerController::class, 'index'])->name('cms.banners');
    Route::post('cms/banners', [BannerController::class, 'store'])->name('cms.banners.store');
    Route::put('cms/banners/{banner}', [BannerController::class, 'update'])->name('cms.banners.update');
    Route::delete('cms/banners/{banner}', [BannerController::class, 'destroy'])->name('cms.banners.destroy');

    Route::middleware('module:blog')->group(function () {
        Route::get('cms/blog', [BlogController::class, 'index'])->name('cms.blog');
        Route::post('cms/blog', [BlogController::class, 'store'])->name('cms.blog.store');
        Route::put('cms/blog/{post}', [BlogController::class, 'update'])->name('cms.blog.update');
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
    Route::post('integrations/{integration}/test', [IntegrationController::class, 'test'])->name('integrations.test');

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
