import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Analytics from "./components/Analytics";
import Footer from "./components/Footer";
import { SUPPORTED_LANGUAGES } from "../../locales/languages";

const LANGUAGE_CONFIRMATION_KEY = "nxtserve-language-confirmed";

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.resolvedLanguage || "en-US"
  );
  const [hasConfirmedLanguage, setHasConfirmedLanguage] = useState(() =>
    SUPPORTED_LANGUAGES.some(
      ({ code }) => localStorage.getItem(LANGUAGE_CONFIRMATION_KEY) === code
    )
  );

  useEffect(() => {
    const activeLanguage = i18n.resolvedLanguage || i18n.language;
    if (SUPPORTED_LANGUAGES.some(({ code }) => code === activeLanguage)) {
      setSelectedLanguage(activeLanguage);
    }
  }, [i18n.language, i18n.resolvedLanguage]);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
  };

  const handleContinue = () => {
    localStorage.setItem(LANGUAGE_CONFIRMATION_KEY, selectedLanguage);
    setHasConfirmedLanguage(true);
  };

  if (!hasConfirmedLanguage) {
    return (
      <main
        className="min-h-screen flex items-center justify-center bg-[#F6F2F0] px-4 py-10"
        dir={i18n.dir(selectedLanguage)}
      >
        <section
          aria-labelledby="language-selection-title"
          className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl sm:p-10"
        >
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#F53900]">
              NxtServe
            </p>
            <h1
              id="language-selection-title"
              className="text-2xl font-bold text-[#22252D] sm:text-3xl"
            >
              {t("chooseYourLanguage")}
            </h1>
            <p className="mt-3 text-[#676664]">
              {t("languageSelectionDescription")}
            </p>
          </div>

          <div
            aria-label={t("chooseYourLanguage")}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            role="group"
          >
            {SUPPORTED_LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                aria-pressed={selectedLanguage === code}
                onClick={() => handleLanguageSelect(code)}
                className={`rounded-xl border px-4 py-3 text-start font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#F53900] ${
                  selectedLanguage === code
                    ? "border-[#F53900] bg-orange-50 text-[#22252D]"
                    : "border-[#E5E5E5] text-[#676664] hover:border-[#F53900]/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="mt-8 w-full rounded-xl bg-[#F53900] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#dc3300] focus:outline-none focus:ring-2 focus:ring-[#F53900] focus:ring-offset-2"
          >
            {t("continue")}
          </button>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Analytics />
      <Footer />
    </div>
  );
};

export default LandingPage;
