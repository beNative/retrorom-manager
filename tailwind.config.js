/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                retro: {
                    900: '#1a1b26',
                    800: '#24283b',
                    700: '#414868',
                    accent: '#7aa2f7',
                    success: '#9ece6a',
                    warning: '#e0af68',
                    error: '#f7768e',
                }
            }
        },
    },
    plugins: [],
}
