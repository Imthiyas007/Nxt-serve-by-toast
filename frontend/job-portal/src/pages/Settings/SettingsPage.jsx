import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";
import Navbar from "../../components/layout/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const SettingsContent = ({ user, t, onLanguageChange, isSavingLanguage }) => (
  <div className="mx-auto max-w-4xl space-y-6">
    <header>
      <h1 className="text-2xl font-semibold text-[#2A2A2A]">
        {t("settings")}
      </h1>
      <p className="mt-2 text-sm text-[#6B6A6A]">
        {t("settingsDescription")}
      </p>
    </header>

    <section
      aria-labelledby="preferences-heading"
      className="rounded-2xl border border-[#FEFAF9] bg-[#FEFAF9] p-6 shadow-sm"
    >
      <h2
        id="preferences-heading"
        className="text-lg font-semibold text-[#2A2A2A]"
      >
        {t("preferences")}
      </h2>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-medium text-[#2A2A2A]">{t("language")}</h3>
          <p className="mt-1 text-sm text-[#6B6A6A]">
            {t("languagePreferenceDescription")}
          </p>
        </div>
        <LanguageSwitcher
          onLanguageChange={onLanguageChange}
          disabled={isSavingLanguage}
        />
      </div>
      {isSavingLanguage && (
        <p role="status" className="mt-3 text-sm text-[#676664]">
          {t("savingLanguagePreference")}
        </p>
      )}
    </section>

    <section
      aria-labelledby="account-settings-heading"
      className="rounded-2xl border border-[#FEFAF9] bg-[#FEFAF9] p-6 shadow-sm"
    >
      <h2
        id="account-settings-heading"
        className="text-lg font-semibold text-[#2A2A2A]"
      >
        {t("accountSettings")}
      </h2>
      <p className="mt-2 text-sm text-[#6B6A6A]">
        {t("accountSettingsDescription")}
      </p>
      <p className="mt-4 text-sm text-[#2A2A2A]">{user?.email}</p>
      <Link
        to={user?.role === "employer" ? "/company-profile" : "/profile"}
        className="mt-4 inline-flex rounded-lg bg-[#EB611F] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d4551b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB611F] focus-visible:ring-offset-2"
      >
        {t("viewProfile")}
      </Link>
    </section>
  </div>
);

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { t, i18n } = useTranslation();
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);

  const handleLanguageChange = async (language) => {
    const previousLanguage = i18n.resolvedLanguage || i18n.language;
    setIsSavingLanguage(true);

    try {
      await axiosInstance.put(API_PATHS.USER.UPDATE_PREFERENCES, {
        preferredLanguage: language,
      });
      updateUser({ preferredLanguage: language });
      await i18n.changeLanguage(language);
      toast.success(t("languagePreferenceSaved"));
    } catch (error) {
      await i18n.changeLanguage(previousLanguage);
      console.error("Failed to save language preference:", error);
      toast.error(t("languagePreferenceSaveFailed"));
    } finally {
      setIsSavingLanguage(false);
    }
  };

  if (user?.role === "employer") {
    return (
      <DashboardLayout activeMenu="settings">
        <SettingsContent
          user={user}
          t={t}
          onLanguageChange={handleLanguageChange}
          isSavingLanguage={isSavingLanguage}
        />
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEF7F4]/95">
      <Navbar />
      <main className="container mx-auto px-4 pb-10 pt-24">
        <SettingsContent
          user={user}
          t={t}
          onLanguageChange={handleLanguageChange}
          isSavingLanguage={isSavingLanguage}
        />
      </main>
    </div>
  );
};

export default SettingsPage;
