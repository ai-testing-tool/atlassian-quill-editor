import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}', './demo/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        adf: {
          border: '#dfe1e6',
          muted: '#6b778c',
          panel: {
            info: '#deebff',
            note: '#eae6ff',
            warning: '#fffae6',
            success: '#e3fcef',
            error: '#ffebe6',
            custom: '#f4f5f7',
          },
          status: {
            neutral: '#dfe1e6',
            purple: '#eae6ff',
            blue: '#deebff',
            red: '#ffebe6',
            yellow: '#fffae6',
            green: '#e3fcef',
          },
        },
      },
      fontFamily: {
        sans: ['"Atlassian Sans"', 'Charlie Text', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"SF Mono"', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
  prefix: 'aqe-',
  corePlugins: {
    preflight: false,
  },
} satisfies Config;
