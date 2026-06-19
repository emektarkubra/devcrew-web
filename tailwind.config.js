/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,scss}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ─── GitHub Dark ────────────────────────────────────
        'gh-bg-primary':     '#0d1117',
        'gh-bg-secondary':   '#161b22',
        'gh-bg-tertiary':    '#21262d',
        'gh-bg-overlay':     '#2d333b',
        'gh-border':         '#30363d',
        'gh-border-muted':   '#21262d',
        'gh-text-primary':   '#e6edf3',
        'gh-text-secondary': '#8b949e',
        'gh-text-muted':     '#6e7681',

        'gh-blue':           '#1f6feb',
        'gh-blue-light':     '#388bfd',
        'gh-blue-bg':        '#1c2d3f',
        'gh-blue-border':    '#1f6feb',
        'gh-blue-text':      '#58a6ff',

        'gh-green':          '#238636',
        'gh-green-bg':       '#1b2b1f',
        'gh-green-border':   '#2ea043',
        'gh-green-text':     '#3fb950',

        'gh-red':            '#da3633',
        'gh-red-bg':         '#2d1a1a',
        'gh-red-border':     '#f85149',
        'gh-red-text':       '#f85149',

        'gh-yellow':         '#9e6a03',
        'gh-yellow-bg':      '#2d2415',
        'gh-yellow-border':  '#9e6a03',
        'gh-yellow-text':    '#e3b341',

        'gh-purple':         '#8957e5',
        'gh-purple-bg':      '#2d1b4e',
        'gh-purple-border':  '#8957e5',
        'gh-purple-text':    '#bc8cff',

        'gh-orange':         '#bd561d',
        'gh-orange-bg':      '#2d1a0e',
        'gh-orange-border':  '#bd561d',
        'gh-orange-text':    '#f0883e',

        'gh-pink':           '#db61a2',
        'gh-pink-bg':        '#2d1a27',
        'gh-pink-border':    '#db61a2',
        'gh-pink-text':      '#f778ba',

        'gh-coral':          '#e16f4f',
        'gh-coral-bg':       '#2d1a15',
        'gh-coral-border':   '#e16f4f',
        'gh-coral-text':     '#ffa28b',

        // ─── GitHub Light ────────────────────────────────────
        'gh-light-bg-primary':    '#ffffff',
        'gh-light-bg-secondary':  '#f6f8fa',
        'gh-light-bg-tertiary':   '#eaeef2',
        'gh-light-bg-overlay':    '#ffffff',
        'gh-light-border':        '#d0d7de',
        'gh-light-border-muted':  '#d8dee4',

        'gh-light-text-primary':   '#1f2328',
        'gh-light-text-secondary': '#656d76',
        'gh-light-text-muted':     '#8c959f',
        'gh-light-text-tertiary':  '#8c959f',
        'gh-light-text-link':      '#0969da',

        'gh-light-blue':          '#0969da',
        'gh-light-blue-hover':    '#0860ca',
        'gh-light-blue-bg':       '#ddf4ff',
        'gh-light-blue-border':   '#54aeff',
        'gh-light-blue-text':     '#0550ae',

        'gh-light-green':         '#1a7f37',
        'gh-light-green-bg':      '#dafbe1',
        'gh-light-green-border':  '#aceebb',
        'gh-light-green-text':    '#116329',
        'gh-light-green-btn':     '#2da44e',
        'gh-light-green-hover':   '#1a7f37',

        'gh-light-red':           '#d1242f',
        'gh-light-red-bg':        '#ffebe9',
        'gh-light-red-border':    '#ffcecb',
        'gh-light-red-text':      '#82071e',
        'gh-light-red-hover':     '#c11227',

        'gh-light-yellow':        '#9a6700',
        'gh-light-yellow-bg':     '#fff8c5',
        'gh-light-yellow-border': '#eac54f',
        'gh-light-yellow-text':   '#7d4e00',
        'gh-light-yellow-hover':  '#8a5e00',

        'gh-light-purple':        '#8250df',
        'gh-light-purple-bg':     '#fbefff',
        'gh-light-purple-border': '#d2a8ff',
        'gh-light-purple-text':   '#6639ba',
        'gh-light-purple-hover':  '#6639ba',
        'gh-light-purple-muted':  '#a475f9',

        'gh-light-orange':        '#bc4c00',
        'gh-light-orange-bg':     '#fff1e5',
        'gh-light-orange-border': '#ffc680',
        'gh-light-orange-text':   '#953800',

        'gh-light-pink':          '#bf3989',
        'gh-light-pink-bg':       '#ffeff7',
        'gh-light-pink-border':   '#ff80c8',
        'gh-light-pink-text':     '#99286e',

        'gh-light-coral':         '#c24e00',
        'gh-light-coral-bg':      '#fff0eb',
        'gh-light-coral-border':  '#ffb4a1',
        'gh-light-coral-text':    '#a93600',
      },
    },
  },
  plugins: [],
}