import { createInstance } from 'i18next';
import HttpBackend from 'i18next-http-backend';

const cvI18n = createInstance();

cvI18n
  .use(HttpBackend)
  .init({
    supportedLngs: ['en', 'ro', 'fr', 'es', 'de', 'it', 'pt', 'el', 'ru'],
    fallbackLng: 'en',
    ns: ['cvTemplate', 'months'],
    defaultNS: 'cvTemplate',
    backend: { loadPath: '/locales/cv/{{lng}}/{{ns}}.json' },
});

export default cvI18n;