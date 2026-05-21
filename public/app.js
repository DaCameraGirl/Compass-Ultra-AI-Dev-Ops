const messagesEl = document.querySelector('#messages');
const form = document.querySelector('#chat-form');
const input = document.querySelector('#message-input');
const promptButtons = document.querySelectorAll('[data-prompt]');

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

async function sendMessage(message) {
  addMessage('user', message);
  history.push({ role: 'user', content: message });

  const thinking = document.createElement('article');
  thinking.className = 'message assistant';
  thinking.textContent = 'Thinking through the release state...';
  messagesEl.appendChild(thinking);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Chat request failed');

    thinking.remove();
    addMessage('assistant', data.answer, data.mode === 'ai-provider' ? 'AI provider' : 'Local release assistant');
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

addMessage('assistant', 'I am your Compass Ultra AI DevOps assistant. Ask me what should block a release, how to handle rollback, what payloads to send, or how CI should gate the demo.', 'Local release assistant');
