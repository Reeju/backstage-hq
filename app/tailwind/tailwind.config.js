// Theme values copied from docs/04-design/assets/tailwind-config.js (see docs/04-design/design-system.md).
module.exports = {
  content: ['./bhq/**/*.html', './bhq/**/*.py'],
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
