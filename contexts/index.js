import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { ScoreProvider } from './ScoreContext';
import { LanguageProvider } from './LanguageContext';

export const GlobalProvider = ({ children }) => {
  return (
    <ThemeProvider>
      <ScoreProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </ScoreProvider>
    </ThemeProvider>
  );
};
