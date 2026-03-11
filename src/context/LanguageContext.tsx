import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState(sessionStorage.getItem("lang"));

  // Load saved language on mount
  useEffect(() => {
    const savedLang = (sessionStorage.getItem("lang") || "en");
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  // Save language on change
  useEffect(() => {
    sessionStorage.setItem("lang", lang || "en");
  }, [lang]);

  const changeLanguage = (code) => {
    setLang(code);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};