/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3d98f4',
        'secondary': '#e0f2fe',
        'background': '#f8fafc',
        'text-primary': '#1e3a8a',
        'text-secondary': '#64748b',
        'accent': '#bfdbfe',
      },
    },
  },
  plugins: [],
}