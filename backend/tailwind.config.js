/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.jsx',
    ],
    theme: {
        extend: {
            colors: {
                navy: {
                    950: '#071426',
                    900: '#0f172a',
                    800: '#102541',
                },
                sapphire: {
                    500: '#258eff',
                    600: '#1e7fea',
                },
                azure: {
                    400: '#48a4ff',
                    500: '#25d2c1',
                },
            },
        },
    },
    plugins: [],
};
