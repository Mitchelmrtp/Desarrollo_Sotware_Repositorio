// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-bg': '#E9DFE7', // Define el color personalizado
        'custom-hero': '#FFF3E3',
        'custom-btn': '#C06DA7',
        'custom-primary': '#f10984',

      },
    },
  },
  plugins: [],
};