import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../locales/languages';

const LanguageSwitcher = ({ onLanguageChange, disabled = false }) => {
  const { t, i18n } = useTranslation();

  return (
    <select
      aria-label={t('selectLanguage')}
      value={i18n.resolvedLanguage || i18n.language}
      disabled={disabled}
      onChange={(event) => onLanguageChange(event.target.value)}
      className="bg-white border border-gray-300 text-[#676664] rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
    >
      {SUPPORTED_LANGUAGES.map(({ code, label }) => (
        <option key={code} value={code}>{label}</option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;
