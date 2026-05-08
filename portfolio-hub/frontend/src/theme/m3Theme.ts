import { useMemo } from 'react';
import {
  argbFromHex,
  hexFromArgb,
  CorePalette,
  Scheme,
} from '@material/material-color-utilities';
import { ThemeOptions, createTheme } from '@mui/material/styles';

const SOURCE_COLOR = '#7c6fb8';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function useM3Theme() {
  return useMemo(() => {
    const argb = argbFromHex(SOURCE_COLOR);
    const core = CorePalette.of(argb);
    const scheme = Scheme.light(argb);

    const primary = hexFromArgb(scheme.primary);
    const onPrimary = hexFromArgb(scheme.onPrimary);
    const primaryContainer = hexFromArgb(scheme.primaryContainer);
    const onPrimaryContainer = hexFromArgb(scheme.onPrimaryContainer);

    const secondary = hexFromArgb(scheme.secondary);
    const onSecondary = hexFromArgb(scheme.onSecondary);
    const secondaryContainer = hexFromArgb(scheme.secondaryContainer);
    const onSecondaryContainer = hexFromArgb(scheme.onSecondaryContainer);

    const tertiary = hexFromArgb(scheme.tertiary);
    const onTertiary = hexFromArgb(scheme.onTertiary);
    const tertiaryContainer = hexFromArgb(scheme.tertiaryContainer);
    const onTertiaryContainer = hexFromArgb(scheme.onTertiaryContainer);

    const error = hexFromArgb(scheme.error);
    const onError = hexFromArgb(scheme.onError);
    const errorContainer = hexFromArgb(scheme.errorContainer);
    const onErrorContainer = hexFromArgb(scheme.onErrorContainer);

    const surface = hexFromArgb(scheme.surface);
    const onSurface = hexFromArgb(scheme.onSurface);
    const surfaceVariant = hexFromArgb(scheme.surfaceVariant);
    const onSurfaceVariant = hexFromArgb(scheme.onSurfaceVariant);
    const surfaceDim = hexFromArgb(core.n1.tone(87));
    const surfaceBright = hexFromArgb(core.n1.tone(98));
    const outline = hexFromArgb(scheme.outline);
    const outlineVariant = hexFromArgb(scheme.outlineVariant);

    const inverseSurface = hexFromArgb(scheme.inverseSurface);
    const inverseOnSurface = hexFromArgb(scheme.inverseOnSurface);
    const inversePrimary = hexFromArgb(scheme.inversePrimary);

    const background = hexFromArgb(scheme.background);
    const onBackground = hexFromArgb(scheme.onBackground);

    const shadow = hexFromArgb(scheme.shadow);
    const scrim = hexFromArgb(scheme.scrim);

    const palette: ThemeOptions['palette'] = {
      mode: 'light',
      primary: {
        main: primary,
        light: hexFromArgb(core.a1.tone(80)),
        dark: hexFromArgb(core.a1.tone(30)),
        contrastText: onPrimary,
      },
      secondary: {
        main: secondary,
        light: hexFromArgb(core.a2.tone(80)),
        dark: hexFromArgb(core.a2.tone(30)),
        contrastText: onSecondary,
      },
      error: {
        main: error,
        light: hexFromArgb(core.error.tone(80)),
        dark: hexFromArgb(core.error.tone(30)),
        contrastText: onError,
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
      },
      success: {
        main: '#22c55e',
        light: '#4ade80',
        dark: '#16a34a',
      },
      info: {
        main: primary,
        light: hexFromArgb(core.a1.tone(90)),
        dark: hexFromArgb(core.a1.tone(20)),
      },
      background: {
        default: background,
        paper: surface,
      },
      text: {
        primary: onSurface,
        secondary: onSurfaceVariant,
        disabled: hexToRgba(onSurface, 0.38),
      },
      divider: hexToRgba(outlineVariant, 0.6),
      action: {
        active: onSurface,
        hover: hexToRgba(primary, 0.08),
        selected: hexToRgba(primary, 0.12),
        disabled: hexToRgba(onSurface, 0.38),
        disabledBackground: hexToRgba(onSurface, 0.12),
      },
      common: {
        black: '#000000',
        white: '#ffffff',
      },
    } as any;

    const m3Tokens = {
      primary,
      onPrimary,
      primaryContainer,
      onPrimaryContainer,
      secondary,
      onSecondary,
      secondaryContainer,
      onSecondaryContainer,
      tertiary,
      onTertiary,
      tertiaryContainer,
      onTertiaryContainer,
      error,
      onError,
      errorContainer,
      onErrorContainer,
      surface,
      onSurface,
      surfaceVariant,
      onSurfaceVariant,
      surfaceDim,
      surfaceBright,
      outline,
      outlineVariant,
      inverseSurface,
      inverseOnSurface,
      inversePrimary,
      background,
      onBackground,
      shadow,
      scrim,
    };

    const theme = createTheme({
      ...palette,
      shape: {
        borderRadius: 16,
      },
      typography: {
        fontFamily: [
          '"Roboto"',
          '"Helvetica Neue"',
          '"Arial"',
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'sans-serif',
        ].join(','),
        h1: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, fontSize: '1.4rem' },
        h2: { fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2, fontSize: '1.2rem' },
        h3: { fontWeight: 600, lineHeight: 1.25, fontSize: '1.1rem' },
        h4: { fontWeight: 600, lineHeight: 1.3, fontSize: '1rem' },
        h5: { fontWeight: 600, lineHeight: 1.35, fontSize: '0.9rem' },
        h6: { fontWeight: 600, lineHeight: 1.4, fontSize: '0.85rem' },
        subtitle1: { fontWeight: 500, letterSpacing: '0.01em', fontSize: '0.8rem' },
        subtitle2: { fontWeight: 500, fontSize: '0.75rem' },
        body1: { letterSpacing: '0.015em', fontSize: '0.775rem' },
        body2: { letterSpacing: '0.01em', fontSize: '0.725rem' },
        button: { textTransform: 'none', fontWeight: 500, fontSize: '0.75rem' },
        caption: { letterSpacing: '0.02em', fontSize: '0.625rem' },
        overline: { fontWeight: 600, letterSpacing: '0.1em', fontSize: '0.575rem' },
      },
      spacing: (factor: number) => `${0.25 * factor}rem`,
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 28,
              padding: '6px 14px',
              fontSize: '0.75rem',
              minWidth: 'auto',
            },
            contained: {
              boxShadow: `0 1px 2px 0 ${hexToRgba(shadow, 0.15)}`,
              '&:hover': {
                boxShadow: `0 2px 4px 0 ${hexToRgba(shadow, 0.2)}`,
              },
            },
            outlined: {
              borderWidth: 1.5,
            },
            text: {
              padding: '4px 10px',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              backgroundImage: 'none',
              boxShadow: `0 1px 3px 0 ${hexToRgba(shadow, 0.08)}, 0 1px 2px -1px ${hexToRgba(shadow, 0.05)}`,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 16,
            },
            elevation1: {
              boxShadow: `0 1px 3px 0 ${hexToRgba(shadow, 0.08)}, 0 1px 2px -1px ${hexToRgba(shadow, 0.05)}`,
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 12,
                '&:hover fieldset': {
                  borderColor: hexToRgba(outline, 0.7),
                },
                '&.Mui-focused fieldset': {
                  borderWidth: 2,
                  borderColor: primary,
                },
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              fontWeight: 500,
              fontSize: '0.6875rem',
              height: 20,
              padding: '0 8px',
            },
          },
        },
        MuiAvatar: {
          styleOverrides: {
            root: {
              borderRadius: 12,
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,
            },
            sizeSmall: {
              padding: 6,
            },
          },
        },
        MuiPagination: {
          styleOverrides: {
            root: {
              '& .MuiPaginationItem-root': {
                borderRadius: 8,
                minWidth: 28,
                height: 28,
                fontSize: '0.7rem',
              },
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 20,
            },
          },
        },
        MuiTable: {
          styleOverrides: {
            root: {
              fontSize: '0.725rem',
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              padding: '8px 12px',
              fontSize: '0.725rem',
            },
            head: {
              fontWeight: 600,
              fontSize: '0.6875rem',
              letterSpacing: '0.05em',
            },
          },
        },
      },
    });

    return { theme, m3Tokens };
  }, []);
}