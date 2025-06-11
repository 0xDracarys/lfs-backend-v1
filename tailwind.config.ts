
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// LFS Builder custom colors
				lfs: {
					'root': '#FF6B6B',       // Root user context
					'lfs-user': '#4ECDC4',   // LFS user context
					'chroot': '#F9DC5C',     // Chroot context
					'success': '#2ECC71',    // Success indicators
					'error': '#E74C3C',      // Error indicators
					'warning': '#F39C12',    // Warning indicators
					'info': '#3498DB',       // Info indicators
					'progress': '#9B59B6',   // Progress indicators
				},
        // User-Provided Palette Key Choices
        'theme-bg-primary': '#111927',
        'theme-bg-secondary': '#141c2b',
        'theme-text-primary': '#ffffff',
        'theme-text-secondary': '#c4c4c4',
        'theme-accent-lime': '#aeea00',
        'theme-accent-blue': '#0088ff',
        'theme-status-error': '#ff3e3e',
        'theme-status-warning': '#ffc400',
        'theme-status-success': '#4caf50',
        'theme-border-primary': '#283142',

        // Full User-Provided Palette (JS compatible names)
        blueViolet100: '#e8eaf6', blueViolet200: '#c5cae9', blueViolet300: '#a3accb', blueViolet400: '#818eaE', blueViolet500: '#5f7090', blueViolet600: '#4d5b75', blueViolet700: '#3b455a', blueViolet800: '#283142', blueViolet900: '#1f2634', blueViolet1000: '#1a202c', blueViolet1100: '#141c2b', blueViolet1200: '#131826', blueViolet1300: '#111927', blueViolet1400: '#101522', blueViolet1500: '#0f1420', blueViolet1600: '#0d121d', blueViolet1700: '#0c101a', blueViolet1800: '#0b0f18', blueViolet1900: '#0a0d15', blueViolet2000: '#090c13', blueViolet2100: '#080b12', blueViolet2200: '#070a10', blueViolet2300: '#06090f', blueViolet2400: '#05080e', blueViolet2500: '#04070d',
        gray100: '#ffffff', gray200: '#fafafa', gray300: '#f5f5f5', gray400: '#f0f0f0', gray500: '#ebebeb', gray600: '#e0e0e0', gray700: '#d6d6d6', gray800: '#cccccc', gray900: '#c4c4c4', gray1000: '#bcbcbc', gray1100: '#b1b1b1', gray1200: '#a7a7a7', gray1300: '#9e9e9e', gray1400: '#939393', gray1500: '#888888', gray1600: '#7d7d7d', gray1700: '#717171', gray1800: '#666666', gray1900: '#5b5b5b', gray2000: '#505050', gray2100: '#434343', gray2200: '#363636', gray2300: '#2a2a2a', gray2400: '#1e1e1e', gray2500: '#121212',
        lime100: '#f4ff81', lime200: '#eeff41', lime300: '#c6ff00', lime400: '#aeea00', lime500: '#a1d600', lime600: '#8cb900', lime700: '#789c00', lime800: '#627f00', lime900: '#4d6300', lime1000: '#455a00',
        blue100: '#e3f2fd', blue200: '#bbdefb', blue300: '#90caf9', blue400: '#64b5f6', blue500: '#42a5f5', blue600: '#2196f3', blue700: '#1e88e5', blue800: '#1976d2', blue900: '#1565c0', blue1000: '#0d47a1', blue1100: '#006eff', blue1200: '#0088ff', blue1300: '#00aaff', blue1400: '#00ccff', blue1500: '#00ffff',
        red100: '#ffebee', red200: '#ffcdd2', red300: '#ef9a9a', red400: '#e57373', red500: '#ef5350', red600: '#f44336', red700: '#e53935', red800: '#ff3e3e', red900: '#c62828', red1000: '#b71c1c',
        khaki100: '#fffde7', khaki200: '#fff9c4', khaki300: '#fff59d', khaki400: '#fff176', khaki500: '#ffee58', khaki600: '#ffeb3b', khaki700: '#fdd835', khaki800: '#fbc02d', khaki900: '#f9a825', khaki1000: '#f57f17', khaki1100: '#ffc400', khaki1200: '#ffab00', khaki1300: '#ff9100', khaki1400: '#ff6d00', khaki1500: '#ffc107', khaki1600: '#ff9800',
        green100: '#e8f5e9', green200: '#c8e6c9', green300: '#a5d6a7', green400: '#81c784', green500: '#66bb6a', green600: '#4caf50', green700: '#43a047', green800: '#388e3c', green900: '#2e7d32', green1000: '#1b5e20',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.6' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
