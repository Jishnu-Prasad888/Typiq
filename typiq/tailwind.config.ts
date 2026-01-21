import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx,html}', './index.html'],
  theme: {
    extend: {
      colors: {
        text: {
          primary: '#E1D0B3',
          secondary: '#E1D0B3',
          muted: '#9a8f86',
          inverse: '#ffffff'
        },
        bg: {
          primary: '#1c1917',
          secondary: '#24201d',
          tertiary: '#2f2a26',
          hover: '#3a332e',
          active: '#3a332e'
        },
        border: {
          primary: '#3f3832',
          subtle: '#2a231c'
        },
        accent: {
          green: '#4caf50',
          red: '#7b1e1e',
          orange: '#e67e22',
          brown: '#2a231c',
          gold: '#f4d06f',
          white: '#ffffff',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          teal: '#0d9488'
        }
      }
    }
  },
  plugins: []
}

export default config
