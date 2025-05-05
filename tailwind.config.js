/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}', './node_modules/flowbite/**/*.js'],
  theme: {
    extend: {
      colors: {
        colorCustom: '#CE7878',
        violetCustom: '#5A63B8',
        lavenderCustom: ' #AA7DCE',
        pinkCustom: '#F5D7E3',
        cherryCustom: '#F4A5AE',
        roseCustom: '#A8577E',
        customHsl: {
          warning: 'hsl(4 66% 63%)',
          bkg: 'hsl(190 60% 98)',
          text: 'hsl(185 26% 9%)',
          muted: 'hsl(183 8% 55%)',
          accent: 'hsl(183 74% 44%)',
          warningopacity: 'hsl(4 66% 63% /.1)',
          blueopacity: 'hsl(183 74% 44% / .04)',
          accentopacity: 'hsl(183 74% 44% / .04)',
          amberopacity: 'hsl(26 90.5% 37.1% / 0.04)',
        },
      },
    },
  },
  plugins: [require('flowbite/plugin')],
};
