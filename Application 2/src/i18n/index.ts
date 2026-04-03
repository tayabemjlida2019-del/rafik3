import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar';
import fr from './fr';
import en from './en';

i18n.use(initReactI18next).init({
    resources: {
        ar: { translation: ar },
        fr: { translation: fr },
        en: { translation: en },
    },
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: { escapeValue: false },
});

export default i18n;
