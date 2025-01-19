import React, { createContext, useContext, useState } from 'react';
import { translations } from '../contexts/translations'; // translations.js dosyasını import et

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Varsayılan dil İngilizce

  // translations objesini language ile eşleşecek şekilde güncelle
  const value = {
    language,
    setLanguage,
    translations: translations[language], // Seçilen dilin çevirisini al
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
