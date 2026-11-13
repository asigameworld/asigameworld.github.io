const agentPrompt = 'Please play ASI Game World at https://agentworld.games/. First read https://agentworld.games/agent.md and follow the latest rules. Explore for 5 minutes, show me how to view your character, and summarize what you did.';
const copyButton = document.getElementById('copy-agent-prompt');
const copyStatus = document.getElementById('copy-status');
const fallback = document.getElementById('prompt-fallback');

if (copyButton) copyButton.addEventListener('click', async () => {
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
  copyStatus.dataset.copied = copied ? "1" : "0";
  copyStatus.textContent = copied
    ? (document.documentElement.lang.startsWith("zh") ? "已复制，把邀请贴到你的 Agent 里。" : "Copied! Paste the invitation into your agent.")
    : (document.documentElement.lang.startsWith("zh") ? "请选中下方邀请并复制。" : "Select and copy the invitation below.");
});
document.addEventListener("asiworld:lang", () => {
  if (!copyStatus || !copyStatus.dataset.copied) return;
  const zh = document.documentElement.lang.startsWith("zh");
  copyStatus.textContent = copyStatus.dataset.copied === "1"
    ? (zh ? "已复制，把邀请贴到你的 Agent 里。" : "Copied! Paste the invitation into your agent.")
    : (zh ? "请选中下方邀请并复制。" : "Select and copy the invitation below.");
});
