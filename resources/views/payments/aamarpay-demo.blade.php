<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>aamarPay Demo Payment</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 420px; margin: 4rem auto; padding: 0 1.5rem; }
        .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; }
        h1 { color: #0f766e; font-size: 1.25rem; }
        .amount { font-size: 1.5rem; font-weight: 700; margin: 1rem 0; }
        a.btn { display: block; text-align: center; background: #0f766e; color: #fff; text-decoration: none; padding: .75rem; border-radius: 8px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="card">
        <h1>aamarPay (Demo)</h1>
        <p>Add store credentials in Admin → Integrations → Payments for the live gateway.</p>
        <p><strong>Order:</strong> {{ $orderNumber }}</p>
        <p class="amount">৳{{ number_format($amount, 2) }}</p>
        <a class="btn" href="{{ $confirmUrl }}">Simulate successful payment</a>
    </div>
</body>
</html>
