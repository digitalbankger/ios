// Convert Tailwind configuration to CommonJS so it is loaded correctly
// when the project uses CommonJS modules.  The previous version used
// ESM syntax (import/export) which fails when Node interprets
// .js files as CommonJS (see package.json "type": "commonjs").

// Note: Do not import Vue components here.  Requiring `.vue` files in
// Tailwind config can cause errors when Node tries to parse the file.
// If you need to reference components for Tailwind classes, ensure
// those paths are listed under `content` instead.

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6BA0FF',
        hoverbtn: '#F7F7F7',
        textbtnhover: '#49454F',
        iconcolor: '#49454F',
        cpink: '#ff71c7',
        border: '#11111134',
        productbg: '#F7F7F7',
      },
      borderRadius: {
        '6': '6px',
      },
      height: {
        '50': '50px',
        order: '56px',
        '105': '105px',
      },
      minHeight: {
        '40': '10rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        slider: 'clamp(18px, 8vw, 26px)',
        sliderSmall: '20px',
        '1.5xl': '1.37rem',
      },
      screens: {
        xs: { max: '250px' },
        mm: { max: '430px' },
      },
      width: {
        '18': '4rem',
        '30': '8rem',
        '34': '9rem',
        '38': '11rem',
        '66': '17rem',
        '210': '210px',
      },
      boxShadow: {
        productcard: '0px 1px 2px 0px #3F3F3F26',
        poductcardlg: '0px 1px 18px 0px #3F3F3F26',
      },
      rotate: {
        '135': '135deg',
        '270': '270deg',
      },
      padding: {
        '34': '34px',
      },
    },
  },
  plugins: [],
}