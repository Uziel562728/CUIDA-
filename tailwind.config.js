/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-custom)', // Azul petróleo
          light: '#3A5A84'
        },
        secondary: {
          DEFAULT: '#4A90E2', // Azul suave
          light: '#7FB1EE'
        },
        health: {
          DEFAULT: '#27AE60', // Verde salud
          light: '#48C97B'
        },
        warning: {
          DEFAULT: '#F39C12', // Naranja/Amarillo atención
        },
        danger: {
          DEFAULT: '#E74C3C', // Rojo crítico
        },
        info: {
          DEFAULT: '#3498DB', // Azul información
        },
        background: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
