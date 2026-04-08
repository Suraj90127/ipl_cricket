/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        dark: '#0f172a',
        accent: '#4f46e5', // Indigo 600
        'accent-hover': '#4338ca',
        card: '#ffffff',
        border: '#e2e8f0',
        success: '#10b981', // Emerald 500
        warning: '#f59e0b', // Amber 500
        danger: '#ef4444',  // Red 500
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
        'float': '0 20px 40px -12px rgba(79, 70, 229, 0.15)',
        'glow': '0 0 20px rgba(79, 70, 229, 0.4)'
      },
      fontFamily: {
        sans: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: []
};
