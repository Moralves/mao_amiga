export const theme = {
  colors: {
    primary: '#10B981', // Emerald-500 (Clean, eco-friendly green)
    primaryDark: '#059669', // Emerald-600 (Darker emerald for headings/buttons)
    primaryLight: '#D1FAE5', // Emerald-100 (Soft background for badges)
    primaryText: '#065F46', // Emerald-800 (Dark text on emerald-100 badges)
    
    secondary: '#3B82F6', // Blue-500 (Eco-blue for highlights)
    secondaryLight: '#DBEAFE', // Blue-100
    secondaryText: '#1E40AF', // Blue-800
    
    background: '#F8FAFC', // Slate-50 (Modern clean background)
    cardBg: '#FFFFFF', // Clean white for content blocks
    border: '#E2E8F0', // Slate-200 (Subtle borders)
    
    textMain: '#0F172A', // Slate-900 (High readability headers)
    textSecondary: '#475569', // Slate-600 (Body text and labels)
    textMuted: '#94A3B8', // Slate-400 (Inactive labels and placeholders)
    
    ratingActive: '#F59E0B', // Amber-500 (Star ratings)
    ratingInactive: '#E2E8F0', // Slate-200
    
    error: '#EF4444', // Red-500
    white: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 9999,
  },
  shadows: {
    light: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    dark: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};
