import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

// Get the preferred language from localStorage or use browser language
const savedLanguage = localStorage.getItem('preferredLanguage');
const browserLanguage = navigator.language.split('-')[0]; // 'en-US' -> 'en'
const defaultLanguage = savedLanguage || (browserLanguage === 'en' ? 'en' : 'es');

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es', // Changed to Spanish as fallback
    lng: defaultLanguage,
    debug: false, // Set to false in production
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;