import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ProfileDropdown = ({
  isOpen,
  onToggle,
  avatar,
  companyName,
  email,
  onLogout,
  userRole
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-[#FEFAF9] transition-colors duration-200"
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="h-9 w-9 object-cover rounded-xl"
          />
        ) : (
          <div className="h-8 w-8 bg-[#EB611F] rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {(companyName || email || "?").charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-[#2A2A2A]">{companyName}</p>
          <p className="text-xs text-[#6B6A6A]">
            {userRole === "jobseeker" ? t("jobSeeker") : t("employer")}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-[#6B6A6A]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#FEFAF9] rounded-xl shadow-lg border border-[#FEFAF9] py-2 z-50">
          <div className="px-4 py-3 border-b border-[#FEFAF9]">
            <p className="text-sm font-medium text-[#2A2A2A]">{companyName}</p>
            <p className="text-xs text-[#6B6A6A]">{email}</p>
          </div>

          <Link
            to={userRole === "jobseeker" ? "/profile" : "/company-profile"}
            className="block px-4 py-2 text-sm text-[#6B6A6A] hover:bg-[#FEFAF9] transition-colors"
          >
            {t("viewProfile")}
          </Link>
          <Link
            to="/settings"
            className="block px-4 py-2 text-sm text-[#6B6A6A] hover:bg-[#FEFAF9] transition-colors"
          >
            {t("settings")}
          </Link>
          <div className="border-t border-[#FEFAF9] mt-2 pt-2">
            <button
              type="button"
              onClick={onLogout}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              {t("signOut")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
