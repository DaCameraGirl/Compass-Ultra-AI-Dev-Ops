const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DEMO_URL = process.env.DEMO_URL || 'https://www.compassultra.com/app?demo=true';
const HEADLESS = process.env.HEADLESS !== 'false';
const REPORT_PATH = path.join(__dirname, '..', 'ai-devops-report.html');

async function run() {
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    acceptDownloads: true,
  });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const results = [];

  async function step(name, action) {
    try {
      await action();
      results.push({ name, status: 'PASS', error: '' });
      console.log(`[PASS] ${name}`);
    } catch (err) {
      results.push({ name, status: 'FAIL', error: err.message });
      console.error(`[FAIL] ${name}: ${err.message}`);
    }
  }

  await step('Open demo page', async () => {
    await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 45000 }).catch(() => {});
    await page.waitForSelector('body', { timeout: 15000 });
  });

  await step('Verify Run Risk Analysis button visible', async () => {
    await page.getByText(/Run Risk Analysis/i).first().waitFor({ timeout: 10000 });
  });

  await step('Verify Snapshot Diff button visible', async () => {
    await page.getByText(/Snapshot Diff/i).first().waitFor({ timeout: 10000 });
  });

  await step('Verify Export button visible', async () => {
    await page.getByText(/Export (Certificate|PDF|Runbook)/i).first().waitFor({ timeout: 10000 });
  });

  await step('Toggle a feature flag', async () => {
    const flag = page.getByText(/checkout\.express_pay|express_pay/i).first();
    await flag.scrollIntoViewIfNeeded();
    await flag.click({ timeout: 10000 });
    await page.waitForTimeout(500);
  });

  await step('Run AI risk analysis', async () => {
    await page.getByText(/Run Risk Analysis/i).first().click();
    await page.getByText(/HIGH|WITH CAUTION|WITH-CAUTION|SHIP|HOLD|BLOCKED|ANALYZ/i).first().waitFor({ timeout: 60000 });
  });

  await step('Open snapshot diff', async () => {
    await page.getByText(/Snapshot Diff/i).first().click();
    await page.waitForTimeout(1500);
    const visible = await page.getByText(/Before|After|Diff/i).first().isVisible().catch(() => false);
    if (!visible) throw new Error('Snapshot diff content was not visible');
  });

  await step('Export PDF runbook', async () => {
    const button = page.getByText(/Export (Certificate|PDF|Runbook)/i).first();
    const downloadPromise = page.waitForEvent('download', { timeout: 20000 });
    await button.click();
    const download = await downloadPromise;
    const suggestedName = download.suggestedFilename();
    if (!suggestedName.toLowerCase().endsWith('.pdf')) {
      throw new Error(`Downloaded file is not a PDF: ${suggestedName}`);
    }
    await download.saveAs(path.join(__dirname, '..', 'downloaded-runbook.pdf'));
  });

  await step('Verify policy gates area', async () => {
    await page.getByText(/Policy Checks|Policy Gates|Enterprise Policy/i).first().waitFor({ timeout: 10000 });
  });

  await step('Verify workflow payload areas', async () => {
    await page.getByText(/GitHub|Jira|Slack/i).first().waitFor({ timeout: 10000 });
  });

  await step('Check console errors', async () => {
    if (consoleErrors.length > 0) {
      throw new Error(consoleErrors.slice(0, 5).join(' | '));
    }
  });

  const failed = results.filter((result) => result.status === 'FAIL');
  if (failed.length > 0) {
    await page.screenshot({ path: path.join(__dirname, '..', 'risk-analysis-failure.png'), fullPage: true }).catch(() => {});
  }

  await browser.close();
  generateReport(results);

  if (failed.length > 0) process.exit(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function generateReport(results) {
  const total = results.length;
  const passed = results.filter((result) => result.status === 'PASS').length;
  const failed = results.filter((result) => result.status === 'FAIL').length;
  const rows = results.map((result) => `
    <tr>
      <td>${escapeHtml(result.name)}</td>
      <td class="${result.status.toLowerCase()}">${result.status}</td>
      <td>${escapeHtml(result.error)}</td>
    </tr>`).join('');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Compass Ultra AI DevOps Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }
    h1 { margin-bottom: 8px; }
    .summary { margin: 16px 0; padding: 12px; background: #f3f4f6; border-radius: 8px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; vertical-align: top; }
    th { background: #111827; color: #fff; }
    .pass { color: #047857; font-weight: 700; }
    .fail { color: #b91c1c; font-weight: 700; }
    .timestamp { color: #6b7280; font-size: 13px; }
  </style>
</head>
<body>
  <h1>Compass Ultra AI DevOps Test Report</h1>
  <p class="timestamp">Generated: ${new Date().toISOString()}</p>
  <div class="summary"><strong>Total:</strong> ${total} | <strong>Passed:</strong> ${passed} | <strong>Failed:</strong> ${failed}</div>
  <table>
    <thead><tr><th>Step</th><th>Status</th><th>Error</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

  fs.writeFileSync(REPORT_PATH, html);
  console.log(`Report saved to ${REPORT_PATH}`);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
