/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily:{
        'jetbrain':['Inter','JetBrains Mono']
      },
      colors:{
        "t-main":"#1e1e1e",
        "t-scnd":"#444444",
        "t-thrd":"#323232"
      }
    },
  },
  plugins: [],
}

