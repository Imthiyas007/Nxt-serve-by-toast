import { useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../../context/useAuth";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import logo from "../../../assets/nxtserve-logo.png";

const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleEmployerNavigation = (event) => {
    if (isAuthenticated && user?.role !== "employer") {
      event.preventDefault();
      toast.error(t("employerAccountRequired"));
    }
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <Motion.header
      initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-[#E5E5E5] bg-[#F6F2F0]/95 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            to="/"
            aria-label="NxtServe home"
            className="flex shrink-0 items-center"
            onClick={closeMobileMenu}
          >
            <img src={logo} alt="" className="h-12 w-auto" />
          </Link>

          <nav aria-label={t("mainNavigation")} className="hidden items-center gap-6 md:flex">
            <Link
              to="/find-jobs"
              className="font-medium text-[#676664] transition-colors hover:text-[#22252D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900]"
            >
              {t("forJobSeeker")}
            </Link>
            <Link
              to="/post-job"
              onClick={handleEmployerNavigation}
              className="font-medium text-[#676664] transition-colors hover:text-[#22252D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900]"
            >
              {t("forEmployers")}
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <span className="max-w-40 truncate text-sm text-[#676664]">
                  {t("welcome")}, {user?.name}
                </span>
                <Link
                  to={
                    user?.role === "employer"
                      ? "/employer-dashboard"
                      : "/find-jobs"
                  }
                  className="rounded-lg bg-[#F53900] px-5 py-2 font-medium text-white shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900] focus-visible:ring-offset-2"
                >
                  {t("dashboard")}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 font-medium text-[#676664] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900]"
                >
                  {t("login")}
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-[#F53900] px-5 py-2 font-medium text-white shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900] focus-visible:ring-offset-2"
                >
                  {t("signup")}
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#22252D] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900] md:hidden"
            aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <nav
        id="landing-mobile-menu"
        aria-label={t("mainNavigation")}
        aria-hidden={!mobileMenuOpen}
        className={`${mobileMenuOpen ? "block" : "hidden"} border-t border-[#E5E5E5] bg-[#F6F2F0] px-4 py-4 shadow-lg md:hidden`}
      >
          <div className="container mx-auto flex flex-col gap-2">
            <Link
              to="/find-jobs"
              onClick={closeMobileMenu}
              className="rounded-lg px-3 py-3 font-medium text-[#676664] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900]"
            >
              {t("forJobSeeker")}
            </Link>
            <Link
              to="/post-job"
              onClick={handleEmployerNavigation}
              className="rounded-lg px-3 py-3 font-medium text-[#676664] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900]"
            >
              {t("forEmployers")}
            </Link>
            {isAuthenticated ? (
              <Link
                to={
                  user?.role === "employer"
                    ? "/employer-dashboard"
                    : "/find-jobs"
                }
                onClick={closeMobileMenu}
                className="rounded-lg bg-[#F53900] px-3 py-3 font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900] focus-visible:ring-offset-2"
              >
                {t("dashboard")}
              </Link>
            ) : (
              <div className="mt-2 flex gap-3 border-t border-[#E5E5E5] pt-3">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex-1 rounded-lg px-3 py-3 text-center font-medium text-[#676664] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900]"
                >
                  {t("login")}
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMobileMenu}
                  className="flex-1 rounded-lg bg-[#F53900] px-3 py-3 text-center font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900] focus-visible:ring-offset-2"
                >
                  {t("signup")}
                </Link>
              </div>
            )}
          </div>
      </nav>
    </Motion.header>
  );
};

export default Header;
