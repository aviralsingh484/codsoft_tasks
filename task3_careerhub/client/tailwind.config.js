// Terracotta + sand colour palette
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sand: { 50: '#fbf7f1', 100: '#f4ebdd', 200: '#e9d9c0', 300: '#dcc3a0' },
        terra: { 500: '#c8553d', 600: '#b24a34', 700: '#93392a' },
        ink: '#3a2a22',
        muted: '#85705f'
      },
      fontFamily: { serif: ['Georgia', 'serif'] }
    }
  },
  plugins: []
};
