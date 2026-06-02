/* theme.js — site-wide light/dark theme toggle.
 *
 * Behavior:
 *   - On first load, follow `prefers-color-scheme` unless the user
 *     has previously toggled (in which case use their saved choice).
 *   - toggleTheme() flips the current theme and persists it.
 *
 * Used by: flashcards pages, diagram pages, landing pages.
 * Inline a tiny pre-flight `<script>` in <head> to set the theme
 * before first paint to avoid a light/dark flash.
 */

(function preflight() {
  try {
    const saved = localStorage.getItem('site-theme');
    if (saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) { /* localStorage may be blocked; fall through */ }
})();

function initTheme() { updateThemeIcon(); }

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('site-theme', next); } catch (e) { /* ignore */ }
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.textContent = isDark ? 'Light' : 'Dark';
}

document.addEventListener('DOMContentLoaded', initTheme);
