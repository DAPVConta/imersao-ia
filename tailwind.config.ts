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
        primary: { DEFAULT: token('accent'), deep: token('accent-deep'), foreground: token('on-accent') },
        secondary: { DEFAULT: token('sheet-2'), foreground: token('ink') },
        muted: { DEFAULT: token('paper-2'), foreground: token('ink-mute') },
        destructive: { DEFAULT: token('debit'), foreground: '#ffffff' },
        border: token('rule'),
        input: token('rule-strong'),
        ring: token('accent'),
        // Paleta própria do painel
        paper: { DEFAULT: token('paper'), 2: token('paper-2') },
        sheet: { DEFAULT: token('sheet'), 2: token('sheet-2') },
        ink: { DEFAULT: token('ink'), 2: token('ink-2'), mute: token('ink-mute') },
        rule: { DEFAULT: token('rule'), strong: token('rule-strong') },
        accent: { DEFAULT: token('accent'), deep: token('accent-deep'), foreground: token('on-accent') },
        credit: { DEFAULT: token('credit'), deep: token('credit-deep') },
        debit: { DEFAULT: token('debit'), deep: token('debit-deep') },
        gold: token('gold'),
      },
      fontFamily: {
        sans: ['"Public Sans Variable"', '-apple-system', '"Segoe UI"', 'system-ui', 'sans-serif'],
        /** Só para o valor da cédula e o nome do mês (docs/design.md). */
        cedula: ['"Bodoni Moda Variable"', '"Bodoni 72"', 'Didot', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: '14px',
        md: '10px',
        sm: '8px',
      },
      boxShadow: {
        nota: 'var(--shadow-note)',
      },
    },
  },
  plugins: [animate],
} satisfies Config
