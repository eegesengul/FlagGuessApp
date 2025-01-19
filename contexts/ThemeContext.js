import React, { createContext, useContext, useState } from 'react';
import { themes } from '../constants/theme'; // Assuming themes are imported from this file

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext); // This is the function you're trying to use

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // Default theme is light

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[theme], toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
