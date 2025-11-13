'use client';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Theme configuration based on mode
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
      },
      secondary: {
        main: mode === 'light' ? '#dc004e' : '#f48fb1',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      // Default body text font
      fontFamily: [
        'Instrument Sans',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      // Headings use Clash Display
      h1: {
        fontFamily: [
          'Clash Display',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ].join(','),
        fontWeight: 700,
      },
      h2: {
        fontFamily: [
          'Clash Display',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ].join(','),
        fontWeight: 600,
      },
      h3: {
        fontFamily: [
          'Clash Display',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ].join(','),
        fontWeight: 600,
      },
      h4: {
        fontFamily: [
          'Clash Display',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ].join(','),
        fontWeight: 600,
      },
      h5: {
        fontFamily: [
          'Clash Display',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ].join(','),
        fontWeight: 500,
      },
      h6: {
        fontFamily: [
          'Clash Display',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ].join(','),
        fontWeight: 500,
      },
      // Subtitle uses Clash Display
      subtitle1: {
        fontFamily: [
          'Clash Display',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ].join(','),
        fontWeight: 500,
      },
      subtitle2: {
        fontFamily: [
          'Clash Display',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ].join(','),
        fontWeight: 500,
      },
      // Body and other text use Instrument Sans (default)
      body1: {
        fontFamily: [
          'Instrument Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ].join(','),
      },
      body2: {
        fontFamily: [
          'Instrument Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ].join(','),
      },
      button: {
        fontFamily: [
          'Instrument Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ].join(','),
        fontWeight: 600,
      },
    },
  });

export function AppThemeProvider({ children }) {
  const mode = useSelector((state) => state.theme.mode);
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
