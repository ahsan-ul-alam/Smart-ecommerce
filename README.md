# ArCommerze — Bangladesh Smart eCommerce Platform

Laravel 12 + Inertia.js + React storefront and admin for single-vendor (and optional multi-vendor) commerce in Bangladesh.

## Quick Start

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
npm run dev
# Terminal 2:
php artisan serve
```

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@arcommerze.test` | `password` |
| Customer | `customer@arcommerze.test` | `password` |

- **Shop:** http://127.0.0.1:8000  
- **Admin:** http://127.0.0.1:8000/admin  

## Stack

- Laravel 12, PHP 8.2+, SQLite/MySQL, Sanctum, Spatie Permission  
- React 19, Inertia v2, Tailwind CSS v4  
- Repository + service layer, config-driven modules & integrations  

## Modules (toggle in Admin → Settings → Modules)

| Module | Features |
|--------|----------|
| Core | Products, orders, cart, checkout, COD |
| `coupon` | Cart coupons |
| `flash_sale` | Time-limited sales |
| `loyalty` / `wallet` | Customer rewards at checkout |
| `referral` / `affiliate` | Referral codes & affiliate commissions |
| `reviews` | Product reviews |
| `blog` | CMS blog |
| `pos` | In-store POS, receipts |
| `vendor` | Multi-vendor catalog, storefronts, commissions |
| `abandoned_cart` | Recovery emails/SMS + admin list |
| `analytics` | Reports dashboard |

## Payments (BD + global)

bKash, Nagad, SSLCommerz, aamarPay, Stripe, PayPal, COD — configure under **Settings → Integrations → Payments** (demo modes available).

## Couriers

Pathao, REDX, Steadfast, Paperfly, eCourier — **Settings → Integrations → Couriers**.

## Notifications

**Settings → Notifications** — order email/SMS, abandoned cart, daily low-stock alert (to store email).

## Scheduler

```bash
php artisan schedule:work
```

Runs hourly abandoned-cart reminders and daily low-stock alerts (9:00).

On Windows without Horizon: `php artisan queue:work` for queued jobs.

## Maintenance mode

Enable in **Settings → General**. Shop shows a maintenance page; admin and login remain available.

## OAuth

Set `GOOGLE_CLIENT_ID` / `FACEBOOK_CLIENT_ID` in `.env`. Login page includes Google & Facebook buttons.

## Key admin URLs

| Area | Path |
|------|------|
| Dashboard | `/admin` |
| Products / categories / brands | `/admin/products` |
| Orders + CSV export | `/admin/orders` |
| POS | `/admin/pos` |
| Reports | `/admin/reports` |
| Abandoned carts | `/admin/abandoned-carts` |
| Vendors & commissions | `/admin/vendors` |
| CMS (banners, homepage, pages, blog) | `/admin/cms/banners` |
| Settings | `/admin/settings/general` |

## Environment

```env
DB_CONNECTION=mysql
DB_DATABASE=arcommerze

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

## License

Proprietary — ArCommerze project.
