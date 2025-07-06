export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader("Access-Control-Allow-Origin", "*"); // ou ton domaine précis
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { html } = req.body;
  if (!html) {
    res.status(400).send('Missing HTML content');
    return;
  }

  try {
  const browserlessToken = process.env.BROWSERLESS_TOKEN;
  if (!browserlessToken) {
    throw new Error('BROWSERLESS_TOKEN is not defined');
  }

  const response = await fetch(`https://chrome.browserless.io/pdf?token=${browserlessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html,
      options: {
        format: 'A4',
        printBackground: true,
        margin: { top: '0cm', bottom: '0cm', left: '0cm', right: '0cm' }
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Browserless API error:', errorText);
    throw new Error(`Browserless error: ${errorText}`);
  }

  const pdfBuffer = await response.arrayBuffer();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="cv-ultracvpro.pdf"');
  res.status(200).end(Buffer.from(pdfBuffer));

} catch (error) {
  console.error("Error generating PDF:", error.message || error);
  res.status(500).send(`Error generating PDF: ${error.message || error}`);
}

}
