// File: /api/create-checkout.js

export default async function handler(req, res) {
  console.log("Montonio võti:", process.env.MONTONIO_ACCESS_KEY);

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
      error: "Puuduvad vajalikud andmed. Kontrollige summat, tellimuse ID-d, e-posti aadressi ja tellimuse esemeid."
    });
  }

  try {
    const apiUrl = process.env.NODE_ENV === 'production'
      ? "https://api.montonio.com/checkout"
      : "https://api.sandbox.montonio.com/checkout";

    const apiKey = process.env.MONTONIO_ACCESS_KEY;
    if (!apiKey) {
      throw new Error("Montonio API võti (ACCESS_KEY) puudub.");
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

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        currency,
        return_url: returnUrl || "https://puitunistus.com/edu",
        cancel_url: cancelUrl || "https://puitunistus.com/katkestatud",
        payment_method: "banklink",
        customer: customerData,
        reference: orderId,
        items: formattedItems
      })
    });

    const data = await response.json();

    if (!response.ok || !data.checkout_url) {
      console.error("Montonio API error:", data);
      return res.status(500).json({
        error: "Montonio makselingi loomine ebaõnnestus. Palun kontrollige API võtit ja andmeid."
      });
    }

    return res.status(200).json({ checkout_url: data.checkout_url });

  } catch (error) {
    console.error("Montonio API error:", error);
    return res.status(500).json({
      error: "Tekkis viga Montonio makselingi loomisel. Kontrolli API võtit ja sisendeid."
    });
  }
}

      error: "Tekkis viga Montonio makselingi loomisel. Kontrolli API võtit ja sisendeid."
    });
  }
}
