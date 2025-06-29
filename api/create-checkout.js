export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { ACCESS_KEY, SECRET_KEY } = process.env;

  const response = await fetch("https://sandbox.montonio.com/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ACCESS_KEY}`,
    },
    body: JSON.stringify({
      amount: 2500,
      currency: "EUR",
      return_url: "https://www.puitunistus.com/tellimus-onnestus",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(500).json({ message: "Checkout creation failed", error: data });
  }

  res.status(200).json(data);
}
