/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,scss}",
  ],
  darkMode: "class",
  theme: {
    colors: {
      // ─── Mevcut renkler ───────────────────────────────────
      'darkColor': 'rgb(35,35,41)',
      'softDarkColor': 'rgb(42,42,49)',
      'lightColor': 'rgb(221,221,221)',
      'softLightColor': 'rgb(153,153,153)',
      'lightGray': '#434343',
      'transparentWhite02': 'rgba(255,255,255,0.2)',
      'transparentWhite04': 'rgba(255,255,255,0.4)',
      'transparentWhite06': 'rgba(255,255,255,0.6)',
      'transparentWhite08': 'rgba(255,255,255,0.8)',

      // ─── GitHub Dark ──────────────────────────────────────
      'gh-bg-primary':    '#0d1117',
      'gh-bg-secondary':  '#161b22',
      'gh-bg-tertiary':   '#21262d',
      'gh-border':        '#30363d',
      'gh-text-primary':  '#e6edf3',
      'gh-text-secondary':'#8b949e',
      'gh-text-muted':    '#6e7681',

      'gh-blue':          '#1f6feb',
      'gh-blue-light':    '#388bfd',
      'gh-blue-bg':       '#1c2d3f',
      'gh-blue-border':   '#1f6feb',
      'gh-blue-text':     '#58a6ff',

      'gh-green':         '#238636',
      'gh-green-text':    '#3fb950',
      'gh-green-bg':      '#1b4332',
      'gh-green-border':  '#2ea043',

      'gh-yellow':        '#9e6a03',
      'gh-yellow-text':   '#e3b341',
      'gh-yellow-bg':     '#2d2415',
      'gh-yellow-border': '#9e6a03',

      'gh-purple':        '#8957e5',
      'gh-purple-text':   '#bc8cff',
      'gh-purple-bg':     '#2d1b4e',
      'gh-purple-border': '#8957e5',

      // ─── GitHub Light ─────────────────────────────────────
      'gh-light-bg-primary':   '#ffffff',
      'gh-light-bg-secondary': '#f6f8fa',
      'gh-light-bg-tertiary':  '#eaeef2',
      'gh-light-border':       '#d0d7de',
      'gh-light-text-primary': '#1f2328',
      'gh-light-text-secondary':'#656d76',
      'gh-light-text-muted':   '#8c959f',

      'gh-light-blue':         '#0969da',
      'gh-light-blue-bg':      '#ddf4ff',
      'gh-light-blue-border':  '#54aeff66',
      'gh-light-blue-text':    '#0550ae',
      'gh-light-blue-hover':   '#0860ca',

      'gh-light-green':        '#1a7f37',
      'gh-light-green-bg':     '#dafbe1',
      'gh-light-green-border': '#aceebb',
      'gh-light-green-text':   '#116329',

      'gh-light-yellow':       '#9a6700',
      'gh-light-yellow-bg':    '#fff8c5',
      'gh-light-yellow-border':'#eac54f',

      'gh-light-purple':       '#8250df',
      'gh-light-purple-bg':    '#fbefff',
      'gh-light-purple-border':'#d2a8ff',
      'gh-light-purple-text':  '#6639ba',
    },
  },
  plugins: [],
}