import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium';

export default async function handler(req, res) {
  // ✅ Configuration CORS
  res.setHeader("Access-Control-Allow-Origin", "https://ultracvpro.online"); // Ou "https://ultracvpro.online" pour plus de sécurité
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Gestion du preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const { html } = req.body;
    if (!html) {
      res.status(400).send('Missing HTML content');
      return;
    }

    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="cv-ultracvpro.pdf"');
    res.status(200).end(pdfBuffer);

  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send('Error generating PDF');
  }
}
