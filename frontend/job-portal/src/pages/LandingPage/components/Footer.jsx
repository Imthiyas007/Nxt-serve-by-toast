import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/useAuth";
import toast from "react-hot-toast";
import logo from "../../../assets/nxtserve-logo.png";

const Footer = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const handlePostJobNavigation = (event) => {
    if (isAuthenticated && user?.role !== "employer") {
      event.preventDefault();
      toast.error(t("employerAccountRequired"));
    }
  };

  return (
    <footer className="bg-[#E5E5E5] px-6 pb-10 pt-16 text-[#22252D]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 text-sm sm:grid-cols-2 md:grid-cols-3">
        <div className="space-y-4">
          <Link to="/" aria-label="NxtServe home" className="inline-flex">
            <img src={logo} alt="" className="h-12 w-auto" />
          </Link>
          <p className="max-w-xs text-[#676664]">{t("footerTagline")}</p>
        </div>

        <nav aria-label={t("explore")} className="space-y-3">
          <h2 className="font-semibold text-[#22252D]">{t("explore")}</h2>
          <Link
            to="/"
            className="block text-[#676664] transition-colors hover:text-[#22252D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900]"
          >
            {t("home")}
          </Link>
          <Link
            to="/find-jobs"
            className="block text-[#676664] transition-colors hover:text-[#22252D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900]"
          >
            {t("findJobs")}
          </Link>
          <Link
            to="/post-job"
            onClick={handlePostJobNavigation}
            className="block text-[#676664] transition-colors hover:text-[#22252D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900]"
          >
            {t("postJob")}
          </Link>
        </nav>

        <div className="space-y-3">
          <h2 className="font-semibold text-[#22252D]">{t("contact")}</h2>
          <a
            href="mailto:support@nexserve.com"
            className="break-all text-[#676664] transition-colors hover:text-[#22252D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900]"
          >
            support@nexserve.com
          </a>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-[#D1D1D1] pt-6 text-center text-xs text-[#676664]">
        <p>
          © {new Date().getFullYear()} NxtServe. {t("rightsReserved")}
        </p>
        <p className="mt-2">{t("madeWithLove")}</p>
      </div>
    </footer>
  );
};

export default Footer;
