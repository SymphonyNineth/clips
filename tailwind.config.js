/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: {
    content: ["./src/**/*.{html,ts}"],
    safelist: ["bg-blue-400", "bg-green-400", "bg-red-400"],
  },
  darkMode: false,
  content: [],
  theme: {
    extend: {
      opacity: ["disabled"],
      backgroundColor: ["disabled"],
    },
  },
  plugins: [],
};
