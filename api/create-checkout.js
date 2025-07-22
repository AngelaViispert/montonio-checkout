// File: /api/create-checkout.js

export default async function handler(req, res) {
  console.log("🔥 API käivitus");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    amount,
    currency = "EUR",
    orderId,
    email,
    phone,
    firstName,
    lastName,
    items,
    returnUrl,
    cancelUrl
  } = req.body;

  if (!amount || !orderId || !email || !items || items.length === 0) {
    return res.status(400).json({
      error: "Puuduvad vajalikud andmed. Kontrolli summat, tellimuse ID-d, e-posti ja esemeid."
    });
  }

  try {
    const isProd = process.env.NODE_ENV === 'production';
    const apiUrl = isProd
      ? "https://api.montonio.com/checkout"
      : "https://api.sandbox.montonio.com/checkout";

    const apiKey = process.env.MONTONIO_ACCESS_KEY;
    console.log("🧪 NODE_ENV:", process.env.NODE_ENV);
    console.log("🔑 API võti olemas:", !!apiKey);

    if (!apiKey) {
      return res.status(500).json({ error: "API võti puudub" });
    }

    const customerData = {
      email,
      phone,
      first_name: firstName,
      last_name: lastName
    };

    const formattedItems = items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      metadata: item.metadata || {}
    }));

    const payload = {
      amount,
      currency,
      return_url: returnUrl || "https://puitunistus.com/edu",
      cancel_url: cancelUrl || "https://puitunistus.com/katkestatud",
      payment_method: "banklink",
      customer: customerData,
      reference: orderId,
      items: formattedItems
    };

    console.log("📦 Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || !data.checkout_url) {
      console.error("❌ Montonio API ERROR:", data);
      return res.status(500).json({
        error: "Montonio makselingi loomine ebaõnnestus.",
        details: data
      });
    }

    console.log("✅ Checkout URL:", data.checkout_url);
    return res.status(200).json({ checkout_url: data.checkout_url });

  } catch (error) {
    console.error("💥 Server error:", error);
    return res.status(500).json({
      error: "Viga makselingi loomisel.",
      details: error.message
    });
  }
}
