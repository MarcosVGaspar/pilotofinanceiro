import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
      gridTemplateColumns: {
        '4': 'repeat(4, minmax(0, 1fr))',
        '3': 'repeat(3, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}
export default config
