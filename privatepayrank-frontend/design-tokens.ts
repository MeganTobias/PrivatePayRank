import crypto from 'crypto';

/**
 * Deterministic Design System for PrivatePayRank
 * 
 * Seed calculation:
 * sha256("PrivatePayRank" + "sepolia" + "202510" + "PrivatePayRank.sol")
 */

const projectName = "PrivatePayRank";
const network = "sepolia";
const yearMonth = "202510";
const contractName = "PrivatePayRank.sol";
const seedString = `${projectName}${network}${yearMonth}${contractName}`;
const seed = crypto.createHash('sha256').update(seedString).digest('hex');

// Use seed to deterministically select design choices
const seedNum = parseInt(seed.substring(0, 8), 16);

/**
 * Design System Selection Based on Seed
 * 
 * - Design System: Glassmorphism (毛玻璃效果) - seedNum % 5 = 4
 * - Color Scheme: F Group (Teal/Green/Cyan) - Clear & Natural - seedNum % 8 = 4
 * - Typography: Sans-Serif (Inter) - Modern & Clear - 1.25 scale
 * - Layout: Grid (12-column grid system)
 * - Border Radius: Large (12px)
 * - Shadow: Medium
 * - Transitions: Smooth (300ms)
 */

export const designTokens = {
  system: 'Glassmorphism',
  seed: seed,
  seedNum: seedNum,
  
  colors: {
    light: {
      primary: '#14B8A6',      // Teal
      secondary: '#10B981',    // Green
      accent: '#06B6D4',       // Cyan
      background: '#FFFFFF',
      surface: '#F0FDFA',      // Teal-50
      text: '#134E4A',         // Teal-900
      textSecondary: '#14B8A6', // Teal-500
      border: '#5EEAD4',       // Teal-300
      error: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
    },
    dark: {
      primary: '#2DD4BF',      // Teal-400
      secondary: '#34D399',    // Green-400
      accent: '#22D3EE',       // Cyan-400
      background: '#0F172A',   // Slate-900
      surface: '#1E293B',      // Slate-800
      text: '#F0FDFA',         // Teal-50
      textSecondary: '#99F6E4', // Teal-200
      border: '#0F766E',       // Teal-700
      error: '#F87171',
      success: '#34D399',
      warning: '#FBBF24',
    },
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    scale: 1.25,
    sizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.25rem',     // 20px
      xl: '1.563rem',    // 25px
      '2xl': '1.953rem', // 31px
      '3xl': '2.441rem', // 39px
      '4xl': '3.052rem', // 49px
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    unit: 8, // 基础间距单位 8px
    scale: {
      xs: '0.5rem',   // 8px
      sm: '1rem',     // 16px
      md: '1.5rem',   // 24px
      lg: '2rem',     // 32px
      xl: '3rem',     // 48px
      '2xl': '4rem',  // 64px
    },
  },
  
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',    // Glassmorphism特色
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',    // 标准阴影
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    // Glassmorphism 特殊阴影
    glass: '0 8px 32px 0 rgba(20, 184, 166, 0.15)',
    'glass-lg': '0 8px 32px 0 rgba(20, 184, 166, 0.25)',
  },
  
  borders: {
    width: {
      none: '0',
      thin: '0.5px',
      default: '1px',
      medium: '1.5px',
      thick: '2px',
    },
  },
  
  transitions: {
    duration: 300,  // Smooth transitions
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 100,
    normal: 200,
    slow: 300,
  },
  
  layout: {
    type: 'grid',  // Grid layout
    maxWidth: '1280px',
    containerPadding: '2rem',
    gridColumns: 12,
    gap: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
    },
  },
  
  // Glassmorphism 特定样式
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.1)',
    backgroundDark: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(10px)',
    backdropFilterStrong: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderDark: '1px solid rgba(20, 184, 166, 0.2)',
  },
  
  // Density options
  density: {
    compact: {
      padding: { sm: '4px 8px', md: '8px 16px', lg: '12px 24px' },
      gap: '8px',
      height: { sm: '32px', md: '40px', lg: '48px' },
    },
    comfortable: {
      padding: { sm: '8px 16px', md: '16px 24px', lg: '20px 32px' },
      gap: '16px',
      height: { sm: '40px', md: '48px', lg: '56px' },
    },
  },
  
  // Responsive breakpoints
  breakpoints: {
    mobile: '0px',     // < 768px
    tablet: '768px',   // 768px - 1024px
    desktop: '1024px', // > 1024px
  },
  
  // Accessibility
  accessibility: {
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '#06B6D4', // Accent color
      offset: '2px',
    },
    minContrastRatio: 4.5, // WCAG AA standard
  },
};

export type DesignTokens = typeof designTokens;

// CSS Custom Properties generator
export function generateCSSVariables(theme: 'light' | 'dark' = 'light'): string {
  const colors = designTokens.colors[theme];
  
  return `
    :root {
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --color-background: ${colors.background};
      --color-surface: ${colors.surface};
      --color-text: ${colors.text};
      --color-text-secondary: ${colors.textSecondary};
      --color-border: ${colors.border};
      --color-error: ${colors.error};
      --color-success: ${colors.success};
      --color-warning: ${colors.warning};
      
      --font-sans: ${designTokens.typography.fontFamily.sans.join(', ')};
      --font-mono: ${designTokens.typography.fontFamily.mono.join(', ')};
      
      --transition-duration: ${designTokens.transitions.duration}ms;
      --transition-easing: ${designTokens.transitions.easing};
      
      --border-radius-lg: ${designTokens.borderRadius.lg};
      --shadow-glass: ${designTokens.shadows.glass};
      
      --glass-background: ${designTokens.glassmorphism.background};
      --glass-backdrop-filter: ${designTokens.glassmorphism.backdropFilter};
      --glass-border: ${designTokens.glassmorphism.border};
    }
    
    .dark {
      --color-primary: ${designTokens.colors.dark.primary};
      --color-secondary: ${designTokens.colors.dark.secondary};
      --color-accent: ${designTokens.colors.dark.accent};
      --color-background: ${designTokens.colors.dark.background};
      --color-surface: ${designTokens.colors.dark.surface};
      --color-text: ${designTokens.colors.dark.text};
      --color-text-secondary: ${designTokens.colors.dark.textSecondary};
      --color-border: ${designTokens.colors.dark.border};
      --color-error: ${designTokens.colors.dark.error};
      --color-success: ${designTokens.colors.dark.success};
      --color-warning: ${designTokens.colors.dark.warning};
      
      --glass-background: ${designTokens.glassmorphism.backgroundDark};
      --glass-border: ${designTokens.glassmorphism.borderDark};
    }
  `;
}





