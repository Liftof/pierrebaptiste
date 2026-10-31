(() => {
  const toggle = document.querySelector('.reading-toggle');
  if (!toggle) return;
  const storageKey = 'pb-reading-mode';
  function apply(enabled) {
    document.body.classList.toggle('reading-mode', enabled);
    toggle.setAttribute('aria-checked', String(enabled));
  }
  let enabled = true;
  try { enabled = localStorage.getItem(storageKey) !== 'off'; } catch {}
  apply(enabled);
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    apply(enabled);
    try { localStorage.setItem(storageKey, enabled ? 'on' : 'off'); } catch {}
  });
})();
