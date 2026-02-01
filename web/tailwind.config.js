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
        // Tamkeen Brand Colors
        tamkeen: {
          primary: '#532127',      // Dark maroon - main brand color
          secondary: '#f8edeb',    // Light pink/cream - backgrounds
          text: '#ffffff',         // White - text on dark backgrounds
          accent: '#61ce70',       // Green - highlights, success states
        }
      },
      fontFamily: {
        // Tamkeen Brand Fonts
        sans: ['Open Sans', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
        body: ['Roboto', 'system-ui', 'sans-serif'],
        accent: ['Poppins', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      minHeight: {
        'touch': '44px', // Minimum touch target size
      },
      minWidth: {
        'touch': '44px',
      }
    },
  },
  plugins: [],
}
