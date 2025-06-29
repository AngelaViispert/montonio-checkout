export default async function handler(req, res) {
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
    items
  } = req.body;

  // 🔐 Võtab API võtmed keskkonnamuutujatest
  const accessKey = process.env.ACCESS_KEY;
  const secretKey = process.env.SECRET_KEY;
  const bearerToken = `${accessKey}:${secretKey}`;

  try {
    const response = await fetch("https://api.sandbox.montonio.com/checkout", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${bearerToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        currency,
        return_url: "https://puitunistus.com/edu",
        cancel_url: "https://puitunistus.com/katkestatud",
        payment_method: "banklink",
        customer: {
          email,
          phone,
          first_name: firstName,
          last_name: lastName
        },
        reference: orderId,
        items
      })
    });

    const data = await response.json();
    return res.status(200).json({ checkout_url: data.checkout_url });
  } catch (error) {
    console.error("Montonio API error:", error);
    return res.status(500).json({ error: "Montonio makselingi loomine ebaõnnestus." });
  }
}
