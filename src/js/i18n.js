import { createI18n } from 'vue-i18n';
import it from '../locales/it.json'; // italian text
import en from '../locales/en.json'; // english text

export default createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    it,
    en,
  },
});
