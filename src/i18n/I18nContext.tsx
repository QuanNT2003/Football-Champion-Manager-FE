import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Language, LanguageOption, SUPPORTED_LANGUAGES, Translations } from './types';
import { vi } from './vi';
import { en } from './en';

const dictionaries: Record<Language, Translations> = {
  vi,
  en,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, paramsOrFallback?: Record<string, string | number> | string) => string;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'fc_language';

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language;
    if (saved && (saved === 'vi' || saved === 'en')) {
      return saved;
    }
    // Default to 'vi'
    return 'vi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentLanguageOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const t = (key: string, paramsOrFallback?: Record<string, string | number> | string): string => {
    const currentDict = dictionaries[language] || dictionaries.vi;
    let text = currentDict[key];

    // Fallback to Vietnamese if missing in English or current
    if (!text && language !== 'vi') {
      text = dictionaries.vi[key];
    }

    if (!text) {
      if (typeof paramsOrFallback === 'string') {
        return paramsOrFallback;
      }
      return key;
    }

    // Replace params {key} if object passed
    if (typeof paramsOrFallback === 'object' && paramsOrFallback !== null) {
      Object.entries(paramsOrFallback).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return text;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageOption,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

export * from './types';
