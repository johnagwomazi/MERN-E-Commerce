export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#09111f',
        sand: '#f4ede3',
        bronze: '#b67a44',
        moss: '#2e4f43',
        paper: '#fffaf2'
      },
      boxShadow: {
        glow: '0 20px 60px rgba(182, 122, 68, 0.2)'
      }
    }
  },
  plugins: []
};

