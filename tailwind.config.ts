import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rnec: {
          navy: '#0B2447',
          teal: '#0E6B6B',
          gold: '#C9A840',
          'gold-light': '#E8D49A',
          blue: '#1565C0',
          'light-teal': '#1B8A8A',
          'dark-teal': '#0A5555',
          'bg-gradient-start': '#0B2447',
          'bg-gradient-end': '#0E6B6B',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
