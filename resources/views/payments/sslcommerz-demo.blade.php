<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SSLCommerz Demo Payment</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 420px; margin: 4rem auto; padding: 0 1.5rem; color: #1e293b; }
        .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,.06); }
        h1 { font-size: 1.25rem; margin: 0 0 .5rem; color: #0f766e; }
        p { color: #64748b; font-size: .9rem; line-height: 1.5; }
        .amount { font-size: 1.5rem; font-weight: 700; margin: 1rem 0; }
        a.btn { display: block; text-align: center; background: #0f766e; color: #fff; text-decoration: none; padding: .75rem 1rem; border-radius: 8px; font-weight: 600; margin-top: 1rem; }
        a.btn:hover { background: #0d9488; }
        .note { font-size: .75rem; margin-top: 1rem; padding: .75rem; background: #f0fdfa; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>SSLCommerz (Demo)</h1>
        <p>Store credentials are not configured. This simulates the payment gateway redirect.</p>
        <p><strong>Order:</strong> {{ $orderNumber }}</p>
        <p class="amount">৳{{ number_format($amount, 2) }}</p>
        <a class="btn" href="{{ $confirmUrl }}">Simulate successful payment</a>
        <p class="note">Add your sandbox <strong>Store ID</strong> and <strong>Store Password</strong> under Admin → Settings → Payments to open the real SSLCommerz page.</p>
    </div>
</body>
</html>
