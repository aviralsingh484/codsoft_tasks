/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.js', './components/**/*.js'],
  theme: {
    extend: {
      colors: {
        // main palette
        plum: { DEFAULT: '#3E2D4B', light: '#5B4769', dark: '#2B1F35' },
        mauve: { DEFAULT: '#896780', dark: '#6E5266', light: '#B9A0B2' },
        cream: { DEFAULT: '#E8DFD8', light: '#F4EFEB', dark: '#D6C9BF' },
      },
      fontFamily: {
        heading: ['"Young Serif"', 'Georgia', 'serif'],
        body: ['"Nunito Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
