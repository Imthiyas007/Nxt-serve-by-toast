import { Link } from "react-router-dom";
import { createElement, useState } from "react";
import { BriefcaseBusiness, Building2, ChevronRight, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/useAuth";
import toast from "react-hot-toast";
import logo from "../../../assets/nxtserve-logo.png";

const Footer = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handlePostJobNavigation = (event) => {
    if (isAuthenticated && user?.role !== "employer") {
      event.preventDefault();
      toast.error(t("employerAccountRequired"));
    }
  };

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error(t("invalidEmail"));
      return;
    }
    setSubscribed(true);
    setEmail("");
    toast.success(t("newsletterSubscribed"));
  };

  return (
    <footer className="bg-[#22252D] px-4 pb-8 pt-14 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 md:grid-cols-12">
          <div className="space-y-5 md:col-span-4">
            <Link to="/" aria-label="NxtServe home" className="inline-flex rounded-lg bg-white p-2">
              <img src={logo} alt="" className="h-10 w-auto" />
            </Link>
            <p className="max-w-sm text-sm leading-6 text-white/70">{t("footerTagline")}</p>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <ShieldCheck className="h-5 w-5 text-[#FF7A00]" />
              {t("safeVerifiedHiring")}
            </div>
          </div>

          <nav aria-label={t("forJobSeeker")} className="space-y-3 md:col-span-2">
            <h2 className="text-sm font-semibold text-white">{t("forJobSeeker")}</h2>
            <Link to="/find-jobs" className="block text-sm text-white/70 hover:text-white">{t("findJobs")}</Link>
            <Link to="/saved-jobs" className="block text-sm text-white/70 hover:text-white">{t("savedJobs")}</Link>
            <Link to="/interview-page" className="block text-sm text-white/70 hover:text-white">{t("interviewPrep")}</Link>
          </nav>

          <nav aria-label={t("forEmployers")} className="space-y-3 md:col-span-2">
            <h2 className="text-sm font-semibold text-white">{t("forEmployers")}</h2>
            <Link to="/post-job" onClick={handlePostJobNavigation} className="block text-sm text-white/70 hover:text-white">{t("postJob")}</Link>
            <Link to="/manage-jobs" className="block text-sm text-white/70 hover:text-white">{t("jobManagement")}</Link>
            <Link to="/employer-dashboard" className="block text-sm text-white/70 hover:text-white">{t("dashboard")}</Link>
          </nav>

          <div className="md:col-span-4">
            <h2 className="text-sm font-semibold text-white">{t("stayInLoop")}</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">{t("newsletterText")}</p>
            <form onSubmit={handleSubscribe} className="mt-4">
              <label htmlFor="footer-email" className="sr-only">{t("emailAddress")}</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                  <input
                    id="footer-email"
                    type="email"
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); setSubscribed(false); }}
                    placeholder={t("enterYourEmail")}
                    className="h-11 w-full rounded-lg border border-white/15 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/50 focus:border-[#FF7A00] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30"
                  />
                </div>
                <button type="submit" className="h-11 rounded-lg bg-[#F53900] px-5 text-sm font-semibold text-white hover:bg-[#FF6500] focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:ring-offset-2 focus:ring-offset-[#22252D]">
                  {subscribed ? t("subscribed") : t("subscribe")}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="grid gap-3 pt-8 sm:grid-cols-3">
          {[{ icon: UserRound, text: t("careerTools") }, { icon: BriefcaseBusiness, text: t("verifiedJobs") }, { icon: Building2, text: t("employerDashboard") }].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/80">
              {createElement(Icon, { className: "h-5 w-5 text-[#FF7A00]", "aria-hidden": true })}
              <span className="flex-1">{text}</span>
              <ChevronRight className="h-4 w-4 text-white/40" />
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NxtServe. {t("rightsReserved")}</p>
          <div className="flex gap-5">
            <span>{t("privacyPolicy")}</span>
            <span>{t("terms")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
