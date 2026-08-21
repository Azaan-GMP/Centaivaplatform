import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Centaiva's own visual identity layered over the Aura base so PrimeNG widgets
 * inherit the same blue/green brand ramp used by the design tokens in SCSS.
 */
export const CentaivaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f3f7fe',
      100: '#e8f0fe',
      200: '#c6dafc',
      300: '#a9c9fa',
      400: '#6ba3f2',
      500: '#1a73e8',
      600: '#1662c9',
      700: '#1354ac',
      800: '#0f4287',
      900: '#0c3468',
      950: '#082245',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#1a73e8',
          contrastColor: '#ffffff',
          hoverColor: '#1662c9',
          activeColor: '#1354ac',
        },
        highlight: {
          background: '#e8f0fe',
          focusBackground: '#c6dafc',
          color: '#1553b0',
          focusColor: '#1553b0',
        },
        surface: {
          0: '#ffffff',
          50: '#f7f8fa',
          100: '#f2f4f7',
          200: '#e5e7eb',
          300: '#d3d8de',
          400: '#9aa1ab',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0b1220',
        },
      },
    },
    formField: {
      borderRadius: '6px',
      paddingX: '10px',
      paddingY: '7px',
      focusRing: {
        width: '3px',
        style: 'solid',
        color: 'rgba(26, 115, 232, 0.18)',
        offset: '0',
      },
    },
    content: { borderRadius: '8px' },
    overlay: {
      select: { borderRadius: '8px' },
      popover: { borderRadius: '8px' },
      modal: { borderRadius: '12px' },
    },
  },
});
