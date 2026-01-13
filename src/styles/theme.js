const glassMixin = (isDark) => ({
  card: `
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      background: ${isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)'};
      border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    `,
  input: `
      padding: 12px;
      border-radius: 12px;
      border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
      background: ${isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(241, 245, 249, 0.6)'};
      color: ${isDark ? '#f8fafc' : '#0f172a'};
      font-size: 1rem;
      outline: none;
      transition: all 0.2s ease;
      
      &:focus {
        border-color: #38bdf8;
        box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
      }
    `
});

export const darkTheme = {
  colors: {
    background: '#0f172a', // Slate 900
    surface: 'rgba(30, 41, 59, 0.7)', // Slate 800
    surfaceHighlight: 'rgba(51, 65, 85, 0.8)', // Slate 700
    text: '#f8fafc', // Slate 50
    textSecondary: '#94a3b8', // Slate 400
    primary: '#38bdf8', // Sky 400
    primaryHover: '#0ea5e9', // Sky 500
    danger: '#ef4444', // Red 500
    success: '#22c55e', // Green 500
    border: 'rgba(148, 163, 184, 0.1)'
  },
  glass: glassMixin(true)
};

export const lightTheme = {
  colors: {
    background: '#f8fafc', // Slate 50
    surface: 'rgba(255, 255, 255, 0.7)',
    surfaceHighlight: 'rgba(241, 245, 249, 0.8)', // Slate 100
    text: '#0f172a', // Slate 900
    textSecondary: '#64748b', // Slate 500
    primary: '#0284c7', // Sky 600
    primaryHover: '#0369a1', // Sky 700
    danger: '#ef4444', // Red 500
    success: '#22c55e', // Green 500
    border: 'rgba(148, 163, 184, 0.2)'
  },
  glass: glassMixin(false)
};
