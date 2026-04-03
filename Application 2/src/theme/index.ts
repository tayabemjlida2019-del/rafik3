export const theme = {
    colors: {
        primary: '#C6A75E',
        primaryDark: '#A8893E',
        primaryLight: '#E2C97E',
        gold: '#E2B65B',
        goldGradient: ['#C6A75E', '#E2B65B', '#D4A843'] as const,

        background: '#0F0F1A',
        surface: '#1A1A2E',
        surfaceLight: '#242444',
        card: '#1E1E38',

        text: '#FFFFFF',
        textSecondary: '#A0A0B8',
        textMuted: '#6B6B80',

        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3',

        border: '#2A2A45',
        inputBg: '#1E1E38',
        overlay: 'rgba(0,0,0,0.6)',

        white: '#FFFFFF',
        black: '#000000',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 999,
    },
    fontSize: {
        xs: 11,
        sm: 13,
        md: 15,
        lg: 17,
        xl: 20,
        xxl: 26,
        hero: 34,
    },
    shadow: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
        },
        gold: {
            shadowColor: '#C6A75E',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
        },
    },
};

export type Theme = typeof theme;
