import type { Config } from 'tailwindcss'

export default {
  content: ['./renderer/src/**/*.{tsx,ts,jsx,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Backgrounds */
        bg: {
          primary: '#0E1116',
          secondary: '#141922',
          tertiary: '#1B2230',
          hover: '#1F2635',
          active: '#27304A'
        },

        /* Text */
        text: {
          primary: '#E6E8EB',
          secondary: '#B3B8C4',
          muted: '#7A8191'
        },

        /* Accent Colors */
        accent: {
          blue: '#3A6DF0',
          teal: '#2EC4B6',
          purple: '#8B5CF6',
          red: '#E5535D',
          gold: '#F4B860'
        },

        /* Soft Accent Variants (hover / glow) */
        'accent-soft': {
          blue: '#5C85F6',
          teal: '#5AD9CC',
          purple: '#A78BFA',
          red: '#F07A82',
          gold: '#FFD08A'
        },

        /* Borders */
        border: {
          primary: '#232A3A',
          secondary: '#2D3548',
          subtle: '#1C2230',
          focus: '#3A6DF0',
          error: '#E5535D',
          success: '#2EC4B6'
        }
      },

      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.45)',
        card: '0 10px 30px rgba(0, 0, 0, 0.5)',
        focus: '0 0 0 2px rgba(58, 109, 240, 0.5)'
      },

      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px'
      }
    }
  },
  plugins: []
} satisfies Config
