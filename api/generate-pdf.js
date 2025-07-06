import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium';
import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const { html } = await req.json();

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

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cv-ultracvpro.pdf"'
      }
    });

  } catch (error) {
    console.error(error);
    return new Response('Error generating PDF', { status: 500 });
  }
}
