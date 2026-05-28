<?php

namespace App\Providers;

use App\Domain\Enums\IntegrationType;
use App\Integrations\Couriers\PathaoCourier;
use App\Integrations\Couriers\SteadfastCourier;
use App\Integrations\Couriers\RedxCourier;
use App\Integrations\Couriers\EcourierCourier;
use App\Integrations\Couriers\PaperflyCourier;
use App\Integrations\Payments\AamarpayGateway;
use App\Integrations\Payments\BkashGateway;
use App\Integrations\Payments\NagadGateway;
use App\Integrations\Payments\PaypalGateway;
use App\Integrations\Payments\SslcommerzGateway;
use App\Integrations\Payments\StripeGateway;
use App\Integrations\Email\MailgunProvider;
use App\Integrations\Email\ResendProvider;
use App\Integrations\Email\SesProvider;
use App\Integrations\Email\SmtpIntegrationProvider;
use App\Integrations\Sms\BulkSmsBdProvider;
use App\Integrations\Sms\GreenWebSmsProvider;
use App\Integrations\Sms\TwilioProvider;
use App\Services\Integrations\IntegrationManager;
use Illuminate\Support\ServiceProvider;

class IntegrationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(IntegrationManager::class, function ($app) {
            $manager = new IntegrationManager;

            $manager->register(IntegrationType::Payment, 'bkash', BkashGateway::class);
            $manager->register(IntegrationType::Payment, 'nagad', NagadGateway::class);
            $manager->register(IntegrationType::Payment, 'sslcommerz', SslcommerzGateway::class);
            $manager->register(IntegrationType::Payment, 'aamarpay', AamarpayGateway::class);
            $manager->register(IntegrationType::Payment, 'stripe', StripeGateway::class);
            $manager->register(IntegrationType::Payment, 'paypal', PaypalGateway::class);
            $manager->register(IntegrationType::Courier, 'pathao', PathaoCourier::class);
            $manager->register(IntegrationType::Courier, 'steadfast', SteadfastCourier::class);
            $manager->register(IntegrationType::Courier, 'redx', RedxCourier::class);
            $manager->register(IntegrationType::Courier, 'paperfly', PaperflyCourier::class);
            $manager->register(IntegrationType::Courier, 'ecourier', EcourierCourier::class);
            $manager->register(IntegrationType::Sms, 'bulksmsbd', BulkSmsBdProvider::class);
            $manager->register(IntegrationType::Sms, 'twilio', TwilioProvider::class);
            $manager->register(IntegrationType::Sms, 'greenweb', GreenWebSmsProvider::class);
            $manager->register(IntegrationType::Email, 'smtp', SmtpIntegrationProvider::class);
            $manager->register(IntegrationType::Email, 'mailgun', MailgunProvider::class);
            $manager->register(IntegrationType::Email, 'ses', SesProvider::class);
            $manager->register(IntegrationType::Email, 'resend', ResendProvider::class);

            return $manager;
        });
    }

    public function boot(): void
    {
        //
    }
}
