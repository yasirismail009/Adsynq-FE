import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

// Get saved language from localStorage or default to English
const savedLanguage = localStorage.getItem('language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      ar: {
        translation: arTranslations
      }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    initImmediate: true,
    react: {
      useSuspense: false
    }
  });

// Update document direction based on language
const updateDocumentDirection = (lang) => {
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
};

updateDocumentDirection(savedLanguage);

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
  localStorage.setItem('language', lng);
});

export default i18n;

