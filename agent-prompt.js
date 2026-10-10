const agentPrompt = 'Please play ASI Game World at https://asigameworld.com/. First read https://asigameworld.com/agent.md and follow the latest rules. Explore for 5 minutes, show me how to view your character, and summarize what you did.';
const copyButton = document.getElementById('copy-agent-prompt');
const copyStatus = document.getElementById('copy-status');
const fallback = document.getElementById('prompt-fallback');

copyButton.addEventListener('click', async () => {
  let copied = false;
  copyButton.disabled = true;
  try {
    await navigator.clipboard.writeText(agentPrompt);
    copied = true;
  } catch {
    fallback.value = agentPrompt;
    fallback.hidden = false;
    fallback.select();
    try { copied = document.execCommand('copy'); } catch {}
    if (copied) {
      fallback.hidden = true;
      copyButton.focus();
    }
  } finally {
    copyButton.disabled = false;
  }
  copyStatus.textContent = copied
    ? 'Copied! Paste the invitation into your agent.'
    : 'Select and copy the invitation below.';
});
