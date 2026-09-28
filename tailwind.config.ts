import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

/** Cor definida como canais RGB em src/index.css, para aceitar opacidade (bg-credit/10). */
const token = (nome: string) => `rgb(var(--${nome}) / <alpha-value>)`

export default {
  // O tema é controlado por variáveis CSS (claro/escuro/automático) em src/index.css.
  // Não usamos o prefixo `dark:`: as cores já trocam sozinhas.
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '22px', screens: { '2xl': '1240px' } },
    extend: {
      colors: {
        // Nomes do shadcn/ui, apontando para a paleta do painel
        background: token('paper'),
        foreground: token('ink'),
        card: { DEFAULT: token('sheet'), foreground: token('ink') },
        popover: { DEFAULT: token('sheet'), foreground: token('ink') },
        primary: { DEFAULT: token('navy-3'), deep: token('navy-2'), foreground: token('on-navy') },
        secondary: { DEFAULT: token('sheet-2'), foreground: token('ink') },
        muted: { DEFAULT: token('paper-2'), foreground: token('ink-mute') },
        accent: { DEFAULT: token('paper-2'), foreground: token('ink') },
        destructive: { DEFAULT: token('debit'), foreground: '#ffffff' },
        border: token('rule'),
        input: token('rule-strong'),
        ring: token('gold'),
        // Paleta própria do painel
        paper: { DEFAULT: token('paper'), 2: token('paper-2') },
        sheet: { DEFAULT: token('sheet'), 2: token('sheet-2') },
        ink: { DEFAULT: token('ink'), 2: token('ink-2'), mute: token('ink-mute') },
        rule: { DEFAULT: token('rule'), strong: token('rule-strong') },
        navy: { DEFAULT: token('navy'), 2: token('navy-2'), 3: token('navy-3') },
        'on-navy': { DEFAULT: token('on-navy'), 2: token('on-navy-2') },
        credit: { DEFAULT: token('credit'), deep: token('credit-deep') },
        debit: { DEFAULT: token('debit'), deep: token('debit-deep') },
        gold: { DEFAULT: token('gold'), deep: token('gold-deep'), ink: token('gold-ink') },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', '-apple-system', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        lg: '18px',
        md: '12px',
        sm: '10px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        lift: 'var(--shadow-lift)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
        'fade-in': { from: { opacity: '0', transform: 'translateY(3px)' }, to: { opacity: '1', transform: 'none' } },
        sweep: {
          from: { opacity: '0', transform: 'rotate(-28deg)' },
          to: { opacity: '1', transform: 'rotate(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .55s cubic-bezier(.2,.8,.25,1) both',
        'fade-in': 'fade-in .28s ease',
        sweep: 'sweep .9s cubic-bezier(.2,.8,.25,1) both',
      },
    },
  },
  plugins: [animate],
} satisfies Config
