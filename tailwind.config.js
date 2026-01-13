/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981', // Green accent like Supabase
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        accent: {
          DEFAULT: '#3B82F6',
          500: '#3B82F6',
          600: '#2563EB',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1E293B',
          secondary: {
            light: '#F9FAFB',
            dark: '#334155',
          },
        },
      },
    },
  },
  plugins: [],
}

