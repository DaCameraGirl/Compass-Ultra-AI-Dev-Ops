const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 8787);
const PUBLIC_DIR = path.join(__dirname, 'public');
const DEMO_URL = process.env.DEMO_URL || 'https://www.compassultra.com/app?demo=true';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const SYSTEM_PROMPT = `You are Compass Ultra AI DevOps, a practical release-readiness assistant for teams shipping behind feature flags.
You help with release risk analysis, policy gates, snapshot diffs, PDF runbooks, workflow payloads, CI gates, rollback planning, and launch readiness.
Be concise, concrete, and action-oriented. If data is missing, say what must be checked manually.`;

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function localAnswer(message) {
  const text = message.toLowerCase();

  if (text.includes('risk') || text.includes('analysis')) {
    return `Run the release through four checks:\n\n1. Flag blast radius: critical flags, rollout percentage, and affected services.\n2. Policy gates: approvers, rollback plan, expired flags, and dependency risk.\n3. Snapshot diff: what changed since the last approved state.\n4. Decision: SHIP, WITH CAUTION, or HOLD.\n\nFor the demo, open ${DEMO_URL} and click Run Risk Analysis.`;
  }

  if (text.includes('rollback') || text.includes('kill switch')) {
    return `Rollback checklist:\n\n1. Identify the changed flag keys.\n2. Turn off the riskiest customer-facing flag first.\n3. Confirm policy gates return to pass or warn.\n4. Export the PDF runbook as evidence.\n5. Send GitHub/Jira/Slack payloads to the release channel.\n\nThe kill switch should be treated as a controlled rollback action, not just a panic button.`;
  }

  if (text.includes('github') || text.includes('jira') || text.includes('slack') || text.includes('payload')) {
    return `Workflow payload plan:\n\n- GitHub: create or update a release issue with blocker count, risky flags, and runbook link.\n- Jira: attach the decision, approver state, and rollback notes to the change ticket.\n- Slack: post the release status, decision, owners, and next action to the launch channel.\n\nEach payload should include: release id, decision, risk level, changed flags, policy gate summary, and rollback instructions.`;
  }

  if (text.includes('ci') || text.includes('action') || text.includes('test')) {
    return `CI gate recommendation:\n\n1. Keep unit tests in the main Compass Ultra repo.\n2. Use this repo for external demo checks with Playwright.\n3. Run daily plus manual workflow_dispatch before launches.\n4. Upload the HTML report and any failure screenshot as artifacts.\n5. Treat failed AI risk analysis, missing export, or broken demo load as release blockers.`;
  }

  if (text.includes('launch') || text.includes('readiness') || text.includes('ship')) {
    return `Release readiness scorecard:\n\n- Demo loads cleanly.\n- Risk analyzer returns a decision.\n- Policy gates are visible and actionable.\n- Snapshot diff explains what changed.\n- PDF runbook exports.\n- GitHub/Jira/Slack payloads are ready.\n- Rollback path is obvious.\n\nIf any of those fail, mark the release as HOLD or WITH CAUTION.`;
  }

  return `I can help with Compass Ultra release readiness. Try asking:\n\n- What should block this release?\n- Build me a rollback plan.\n- What should the GitHub/Jira/Slack payload include?\n- How should CI gate the demo?\n- What should I verify before launch?`;
}

async function modelAnswer(message, history) {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.AI_MODEL || 'gpt-4.1-mini';

  if (!apiKey) return null;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-8),
        { role: 'user', content: message },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`AI provider failed: ${response.status} ${details}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

async function handleChat(req, res) {
  try {
    const raw = await readRequestBody(req);
    const body = raw ? JSON.parse(raw) : {};
    const message = String(body.message || '').trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      sendJson(res, 400, { error: 'Message is required' });
      return;
    }

    let answer = null;
    let mode = 'local';

    try {
      answer = await modelAnswer(message, history);
      if (answer) mode = 'ai-provider';
    } catch (err) {
      answer = `${localAnswer(message)}\n\nProvider note: ${err.message}`;
    }

    if (!answer) answer = localAnswer(message);

    sendJson(res, 200, { answer, mode });
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
}

function serveStatic(req, res) {
  const requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const safePath = requestPath === '/' ? '/index.html' : requestPath;
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/chat') {
    handleChat(req, res);
    return;
  }

  if (req.method === 'GET') {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Compass Ultra AI DevOps chatbot running at http://localhost:${PORT}`);
});
