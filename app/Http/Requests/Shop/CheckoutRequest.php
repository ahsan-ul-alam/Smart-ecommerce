<?php

namespace App\Http\Requests\Shop;

use App\Domain\Enums\PaymentMethod;
use App\Services\Geo\BangladeshLocationService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'division' => ['required', 'string', 'max:100'],
            'district' => ['required', 'string', 'max:100'],
            'thana' => ['required', 'string', 'max:100'],
            'local_address' => ['required', 'string', 'max:500'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'customer_note' => ['nullable', 'string', 'max:500'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'loyalty_points' => ['nullable', 'integer', 'min:0'],
            'wallet_amount' => ['nullable', 'numeric', 'min:0'],
            'use_max_loyalty' => ['nullable', 'boolean'],
            'use_max_wallet' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $locations = app(BangladeshLocationService::class);

            if (! $locations->validate(
                $this->input('division'),
                $this->input('district'),
                $this->input('thana'),
            )) {
                $validator->errors()->add('thana', 'Please select a valid thana for the chosen district.');
            }
        });
    }
}
