// Styling Einstellungen für Tailwind CSS-Framework
tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: {
                    olive: '#969b4e',
                    oliveDark: '#7a7e3d',
                    beige: '#e8e4c9',
                    bg: '#f9f9f9'
                }
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'fade-in': 'fadeIn 0.3s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                fadeIn: {
                    'from': { opacity: '0', transform: 'translateY(10px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        }
    }
}