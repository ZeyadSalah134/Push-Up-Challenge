/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode variables
        light: {
          bg: '#F7F4EE',
          surface: '#FFFFFF',
          primary: '#7D8F63',
          'primary-hover': '#6C7D54',
          'surface-secondary': '#E7E1D5',
          text: '#20241D',
          'text-secondary': '#6F7469',
          border: '#DCD7CC',
          success: '#5F7A4A',
        },
        // Dark mode variables
        dark: {
          bg: '#0B1020',
          surface: '#131A2E',
          primary: '#6F8CFF',
          'primary-hover': '#5D78E8',
          'surface-secondary': '#202A45',
          text: '#F4F6FF',
          'text-secondary': '#A8B0C5',
          border: '#29334F',
          success: '#8FA8FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle-light': '0 1px 3px 0 rgba(32, 36, 29, 0.05), 0 1px 2px -1px rgba(32, 36, 29, 0.05)',
        'card-light': '0 4px 6px -1px rgba(32, 36, 29, 0.04), 0 2px 4px -2px rgba(32, 36, 29, 0.04)',
        'subtle-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        'card-dark': '0 4px 12px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
