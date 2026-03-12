import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enJSON from './locales/en.json'
import trJSON from './locales/tr.json'

const resources = {
    en: {
        translation: enJSON
    },
    tr: {
        translation: trJSON
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;