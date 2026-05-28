<?php

return [

    'name' => env('APP_NAME', 'ArCommerze'),

    'default_locale' => env('APP_LOCALE', 'en'),
    'supported_locales' => ['en', 'bn'],

    'locale_labels' => [
        'en' => ['label' => 'English', 'native' => 'English'],
        'bn' => ['label' => 'Bengali', 'native' => 'বাংলা'],
    ],

    'roles' => [
        'super_admin',
        'admin',
        'staff',
        'customer',
    ],

    'modules' => [
        'blog' => ['label' => 'Blog', 'group' => 'cms'],
        'coupon' => ['label' => 'Coupons', 'group' => 'marketing'],
        'flash_sale' => ['label' => 'Flash Sales', 'group' => 'marketing'],
        'loyalty' => ['label' => 'Loyalty Points', 'group' => 'customer'],
        'wallet' => ['label' => 'Wallet', 'group' => 'customer'],
        'referral' => ['label' => 'Referral', 'group' => 'marketing'],
        'reviews' => ['label' => 'Reviews', 'group' => 'catalog'],
        'affiliate' => ['label' => 'Affiliate', 'group' => 'marketing'],
        'analytics' => ['label' => 'Analytics', 'group' => 'system'],
        'abandoned_cart' => ['label' => 'Abandoned Cart', 'group' => 'marketing'],
        'pos' => ['label' => 'POS', 'group' => 'commerce'],
        'vendor' => ['label' => 'Multi Vendor', 'group' => 'commerce'],
        'special_product' => ['label' => 'Special Product Landing', 'group' => 'marketing'],
        'marketing_campaign' => ['label' => 'Campaigns & Popups', 'group' => 'marketing'],
    ],

    'payment_gateways' => [
        'bkash' => ['label' => 'bKash', 'country' => 'BD'],
        'nagad' => ['label' => 'Nagad', 'country' => 'BD'],
        'sslcommerz' => ['label' => 'SSLCommerz', 'country' => 'BD'],
        'aamarpay' => ['label' => 'aamarPay', 'country' => 'BD'],
        'stripe' => ['label' => 'Stripe', 'country' => 'global'],
        'paypal' => ['label' => 'PayPal', 'country' => 'global'],
        'cod' => ['label' => 'Cash on Delivery', 'country' => 'BD'],
    ],

    'couriers' => [
        'pathao' => 'Pathao',
        'redx' => 'REDX',
        'steadfast' => 'Steadfast',
        'paperfly' => 'Paperfly',
        'ecourier' => 'eCourier',
    ],

    'sms_providers' => [
        'twilio' => 'Twilio',
        'bulksmsbd' => 'BulkSMSBD',
        'greenweb' => 'GreenWeb SMS',
    ],

    'email_providers' => [
        'smtp' => 'SMTP',
        'mailgun' => 'Mailgun',
        'ses' => 'Amazon SES',
        'resend' => 'Resend',
    ],

    'oauth_providers' => [
        'google' => 'Google',
        'facebook' => 'Facebook',
    ],

];
