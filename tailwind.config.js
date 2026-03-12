/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    colors: {
      'darkColor': 'rgb(35,35,41)',
      'softDarkColor': 'rgb(42,42,49)',
      'lightColor': 'rgb(221,221,221)',
      'softLightColor': 'rgb(153,153,153)',
      'lightGray': '#434343',
      'transparentWhite02': 'rgba(255,255,255,0.2)',
      'transparentWhite04': 'rgba(255,255,255,0.4)',
      'transparentWhite06': 'rgba(255,255,255,0.6)',
      'transparentWhite08': 'rgba(255,255,255,0.8)',
    },
    // backgroundImage : {
    //   darkImage : 'none',
    //   lightImage : 'url("src/assets/image/light-wool.png")'
    // }
  },
  plugins: [],
}

