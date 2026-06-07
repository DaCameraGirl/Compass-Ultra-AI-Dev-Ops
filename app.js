const messagesEl = document.querySelector('#messages');
const form = document.querySelector('#chat-form');
const input = document.querySelector('#message-input');
const promptButtons = document.querySelectorAll('[data-prompt]');

const DEMO_URL = 'https://www.compassultra.com/app?demo=true';
const history = [];

function addMessage(role, content, meta = '') {
  const item = document.createElement('article');
  item.className = `message ${role}`;
  item.textContent = content;

  if (meta) {
    const metaEl = document.createElement('div');
    metaEl.className = 'meta';
    metaEl.textContent = meta;
    item.appendChild(metaEl);
  }

  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function localAnswer(message) {
  const text = message.toLowerCase();

  if (text.includes('risk') || text.includes('analysis') || text.includes('block')) {
    return `Run the release through four checks:\n\n1. Flag blast radius: critical flags, rollout percentage, and affected services.\n2. Policy gates: approvers, rollback plan, expired flags, and dependency risk.\n3. Snapshot diff: what changed since the last approved state.\n4. Decision: SHIP, WITH CAUTION, or HOLD.\n\nFor the demo, open ${DEMO_URL} and run the risk analysis before calling the release ready.`;
  }

  if (text.includes('rollback') || text.includes('kill switch')) {
    return `Rollback checklist:\n\n1. Identify the changed flag keys.\n2. Turn off the riskiest customer-facing flag first.\n3. Confirm policy gates return to pass or warn.\n4. Export the PDF runbook as evidence.\n5. Send GitHub, Jira, and Slack payloads to the release channel.\n\nTreat the kill switch as a controlled rollback action, not a panic-only button.`;
  }

  if (text.includes('github') || text.includes('jira') || text.includes('slack') || text.includes('payload')) {
    return `Workflow payload plan:\n\n- GitHub: create or update a release issue with blocker count, risky flags, and runbook link.\n- Jira: attach the decision, approver state, and rollback notes to the change ticket.\n- Slack: post the release status, decision, owners, and next action to the launch channel.\n\nEach payload should include release id, decision, risk level, changed flags, policy gate summary, and rollback instructions.`;
  }

  if (text.includes('ci') || text.includes('action') || text.includes('test')) {
    return `CI gate recommendation:\n\n1. Keep unit tests in the main Compass Ultra repo.\n2. Use this repo for external demo checks with Playwright.\n3. Run daily plus manual workflow_dispatch before launches.\n4. Upload the HTML report and any failure screenshot as artifacts.\n5. Treat failed risk analysis, missing export, or broken demo load as release blockers.`;
  }

  if (text.includes('launch') || text.includes('readiness') || text.includes('ship')) {
    return `Release readiness scorecard:\n\n- Demo loads cleanly.\n- Risk analyzer returns a decision.\n- Policy gates are visible and actionable.\n- Snapshot diff explains what changed.\n- PDF runbook exports.\n- GitHub, Jira, and Slack payloads are ready.\n- Rollback path is obvious.\n\nIf any of those fail, mark the release as HOLD or WITH CAUTION.`;
  }

  return `I can help with Compass Ultra release readiness. Try asking:\n\n- What should block this release?\n- Build me a rollback plan.\n- What should the GitHub, Jira, and Slack payload include?\n- How should CI gate the demo?\n- What should I verify before launch?`;
}

function shouldUseServerApi() {
  const localHosts = ['localhost', '127.0.0.1', '::1'];
  const params = new URLSearchParams(window.location.search);
  return localHosts.includes(window.location.hostname) || params.get('api') === '1';
}

async function askServer(message) {
  const response = await fetch('api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Chat request failed');
  return data;
}

async function sendMessage(message) {
  addMessage('user', message);
  history.push({ role: 'user', content: message });

  const thinking = document.createElement('article');
  thinking.className = 'message assistant';
  thinking.textContent = 'Thinking through the release state...';
  messagesEl.appendChild(thinking);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    let data = null;

    if (shouldUseServerApi()) {
      try {
        data = await askServer(message);
      } catch (err) {
        data = { answer: `${localAnswer(message)}\n\nProvider note: ${err.message}`, mode: 'local' };
      }
    } else {
      data = { answer: localAnswer(message), mode: 'pages' };
    }

    thinking.remove();
    const source = data.mode === 'ai-provider' ? 'AI provider' : 'GitHub Pages assistant';
    addMessage('assistant', data.answer, source);
    history.push({ role: 'assistant', content: data.answer });
  } catch (err) {
    thinking.remove();
    addMessage('assistant', `I could not answer that yet. ${err.message}`);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  sendMessage(message);
});

promptButtons.forEach((button) => {
  button.addEventListener('click', () => {
    input.value = button.dataset.prompt;
    input.focus();
  });
});

addMessage('assistant', 'I am your Compass Ultra AI DevOps assistant. Ask me what should block a release, how to handle rollback, what payloads to send, or how CI should gate the demo.', 'GitHub Pages assistant');
