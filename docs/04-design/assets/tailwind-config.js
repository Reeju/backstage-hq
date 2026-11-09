// Loaded right after the Tailwind CDN script on every page. Colours are Tailwind defaults:
// brand = teal, AI = violet, money-owed/attention = amber, danger = red, success = green, neutrals = stone.
// See docs/04-design/design-system.md.
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      fontFamily: { sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans', 'Noto Sans Devanagari', 'sans-serif'] },
      minHeight: { tap: '44px' },
      minWidth: { tap: '44px' }
    }
  }
};
