import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../public/locales/en/common.json';
import enAuth from '../public/locales/en/auth.json';
import enJobs from '../public/locales/en/jobs.json';
import enDashboard from '../public/locales/en/dashboard.json';
import enCustomers from '../public/locales/en/customers.json';
import enParts from '../public/locales/en/parts.json';
import enModels from '../public/locales/en/models.json';
import enWarranties from '../public/locales/en/warranties.json';
import enReports from '../public/locales/en/reports.json';
import enSettings from '../public/locales/en/settings.json';

import thCommon from '../public/locales/th/common.json';
import thAuth from '../public/locales/th/auth.json';
import thJobs from '../public/locales/th/jobs.json';
import thDashboard from '../public/locales/th/dashboard.json';
import thCustomers from '../public/locales/th/customers.json';
import thParts from '../public/locales/th/parts.json';
import thModels from '../public/locales/th/models.json';
import thWarranties from '../public/locales/th/warranties.json';
import thReports from '../public/locales/th/reports.json';
import thSettings from '../public/locales/th/settings.json';

import zhCommon from '../public/locales/zh/common.json';
import zhAuth from '../public/locales/zh/auth.json';
import zhJobs from '../public/locales/zh/jobs.json';
import zhDashboard from '../public/locales/zh/dashboard.json';
import zhCustomers from '../public/locales/zh/customers.json';
import zhParts from '../public/locales/zh/parts.json';
import zhModels from '../public/locales/zh/models.json';
import zhWarranties from '../public/locales/zh/warranties.json';
import zhReports from '../public/locales/zh/reports.json';
import zhSettings from '../public/locales/zh/settings.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    jobs: enJobs,
    dashboard: enDashboard,
    customers: enCustomers,
    parts: enParts,
    models: enModels,
    warranties: enWarranties,
    reports: enReports,
    settings: enSettings,
  },
  th: {
    common: thCommon,
    auth: thAuth,
    jobs: thJobs,
    dashboard: thDashboard,
    customers: thCustomers,
    parts: thParts,
    models: thModels,
    warranties: thWarranties,
    reports: thReports,
    settings: thSettings,
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    jobs: zhJobs,
    dashboard: zhDashboard,
    customers: zhCustomers,
    parts: zhParts,
    models: zhModels,
    warranties: zhWarranties,
    reports: zhReports,
    settings: zhSettings,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'th',
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
