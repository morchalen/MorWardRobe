import { Theme, alpha } from '@mui/material/styles';

export type ColorKey = 'primary' | 'secondary' | 'surface' | 'error' | 'success';

export interface GlassStyleOptions {
  blur?: number;
  saturation?: number;
  opacity?: number;
  borderOpacity?: number;
  shadowOpacity?: number;
}

export const getGlassStyles = (
  theme: Theme,
  colorKey: ColorKey = 'surface',
  options: GlassStyleOptions = {}
) => {
  const {
    blur = 12,
    saturation = 150,
    opacity = 0.28,
    borderOpacity = 0.1,
    shadowOpacity = 0.1,
  } = options;

  const baseColor = colorKey === 'surface'
    ? theme.palette.background.paper
    : theme.palette[colorKey].main;

  const textColor = colorKey === 'surface'
    ? theme.palette.text.primary
    : theme.palette[colorKey].contrastText;

  return {
    backgroundColor: alpha(baseColor, opacity),
    backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    border: `1px solid ${alpha(theme.palette.divider, borderOpacity)}`,
    boxShadow: `0 4px 30px ${alpha(theme.palette.common.black, shadowOpacity)}`,
    color: textColor,
  };
};

export const getGlassCard = (theme: Theme, variant: 'default' | 'elevated' = 'default') => {
  const baseStyles = getGlassStyles(theme, 'surface', {
    blur: variant === 'elevated' ? 16 : 12,
    opacity: variant === 'elevated' ? 0.55 : 0.4,
    shadowOpacity: variant === 'elevated' ? 0.08 : 0.05,
  });

  return {
    ...baseStyles,
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.6),
      boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
      transform: 'translateY(-2px)',
    },
  };
};

export const getGlassButton = (theme: Theme, variant: 'contained' | 'outlined' | 'text' = 'contained') => {
  const baseStyles = {
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    textTransform: 'none' as const,
    fontWeight: 600 as const,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: theme.shape.borderRadius,
  };

  switch (variant) {
    case 'contained':
      return {
        ...baseStyles,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.88)} 0%, ${alpha(theme.palette.primary.dark, 0.92)} 100%)`,
        border: `1px solid ${alpha(theme.palette.common.white, 0.28)}`,
        color: theme.palette.primary.contrastText,
        boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
        '&:hover': {
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.primary.dark, 0.98)} 100%)`,
          boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.18)}`,
        },
      };

    case 'outlined':
      return {
        ...baseStyles,
        backgroundColor: alpha(theme.palette.background.paper, 0.52),
        border: `1.5px solid ${alpha(theme.palette.primary.main, 0.45)}`,
        color: theme.palette.primary.main,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          border: `1.5px solid ${alpha(theme.palette.primary.main, 0.62)}`,
          boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.12)}`,
          transform: 'translateY(-1px)',
        },
      };

    case 'text':
      return {
        ...baseStyles,
        backdropFilter: 'blur(10px) saturate(140%)',
        WebkitBackdropFilter: 'blur(10px) saturate(140%)',
        backgroundColor: 'transparent',
        color: theme.palette.primary.main,
        fontWeight: 500 as const,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          borderRadius: 8,
        },
      };

    default:
      return baseStyles;
  }
};

export const getGlassInput = (theme: Theme) => {
  return {
    backdropFilter: 'blur(16px) saturate(170%)',
    WebkitBackdropFilter: 'blur(16px) saturate(170%)',
    backgroundColor: alpha(theme.palette.background.paper, 0.5),
    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
    transition: 'all 0.2s ease-out',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.65),
      border: `1px solid ${alpha(theme.palette.divider, 0.45)}`,
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.background.paper, 0.75),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`,
    },
  };
};

export const getGlassChip = (theme: Theme, variant: 'default' | 'filled' = 'default') => {
  if (variant === 'filled') {
    return {
      backdropFilter: 'blur(14px) saturate(155%)',
      WebkitBackdropFilter: 'blur(14px) saturate(155%)',
      backgroundColor: alpha(theme.palette.primary.main, 0.28),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
      color: theme.palette.primary.main,
      fontWeight: 600,
      transition: 'all 0.22s ease-out',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.4),
        transform: 'translateY(-1px)',
      },
    };
  }

  return {
    backdropFilter: 'blur(12px) saturate(145%)',
    WebkitBackdropFilter: 'blur(12px) saturate(145%)',
    backgroundColor: alpha(theme.palette.background.paper, 0.48),
    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
    transition: 'all 0.2s ease-out',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.62),
      border: `1px solid ${alpha(theme.palette.divider, 0.45)}`,
      transform: 'translateY(-1px)',
    },
  };
};

export const getGlassFab = (theme: Theme) => {
  return {
    backdropFilter: 'blur(24px) saturate(200%)',
    WebkitBackdropFilter: 'blur(24px) saturate(200%)',
    backgroundColor: alpha(theme.palette.primary.main, 0.85),
    border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.25)}`,
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.95),
      transform: 'scale(1.05) translateY(-2px)',
      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.35)}`,
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  };
};

export const getGlassDialog = (theme: Theme) => {
  return {
    backdropFilter: 'blur(24px) saturate(190%)',
    WebkitBackdropFilter: 'blur(24px) saturate(190%)',
    backgroundColor: alpha(theme.palette.background.paper, 0.88),
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: `0 16px 64px ${alpha(theme.palette.common.black, 0.12)}`,
  };
};

export const getGlassTinted = (theme: Theme, colorKey: 'primary' | 'error' | 'success') => {
  const baseColor = theme.palette[colorKey].main;
  
  return {
    backdropFilter: 'blur(14px) saturate(155%)',
    WebkitBackdropFilter: 'blur(14px) saturate(155%)',
    backgroundColor: alpha(baseColor, 0.2),
    border: `1px solid ${alpha(baseColor, 0.35)}`,
    color: baseColor,
  };
};

export const getGlassSidebar = (theme: Theme) => {
  return {
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.6 : 0.3),
    borderRight: `1px solid ${theme.palette.divider}`,
  };
};