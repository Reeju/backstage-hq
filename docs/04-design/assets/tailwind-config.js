// Loaded right after the Tailwind CDN script on every page. Restyled 2026-11-10 after the owner's reference
// (reference/owner-inbox-mockup.png): cool slate neutrals, one bright blue brand, violet kept for AI,
// amber = needs approval / money owed, red = danger, green = success.
// Components use the CSS variables in app.css; this file keeps Tailwind utilities on the same fonts and colours.
// See docs/04-design/design-system.md.
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans', 'Noto Sans Devanagari', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#2563EB', dark: '#1D4ED8', soft: '#EFF6FF', pill: '#E8F0FE', line: '#BFDBFE' },
        ink: { DEFAULT: '#0F172A', soft: '#475569' },
        ai: { DEFAULT: '#6D28D9', soft: '#F5F3FF', line: '#DDD6FE' }
      },
      minHeight: { tap: '44px' },
      minWidth: { tap: '44px' }
    }
  }
};
