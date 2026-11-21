import { Bookmark, Building, Building2, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import StatusBadge from "../StatusBadge";
import { useTranslation } from "react-i18next";
import formatSalaryRange from "../../utils/formatSalary";

const JobCard = ({ job, onToggleSave, onApply, saved, hideApply, hideSave }) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  return (
    <article className="bg-[#FEF7F4]/95 rounded-2xl border border-[#FEFAF9] p-6 hover:shadow-xl hover:shadow-[#FEFAF9] transition-all duration-300 group relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          {job?.company?.companyLogo ? (
            <img
              src={job?.company?.companyLogo}
              alt={t("companyLogo")}
              className="w-14 h-14 object-cover rounded-2xl border-4 border-white/20 shadow-lg"
            />
          ) : (
            <div className="w-14 h-14 bg-[#FEFAF9] border-2 border-[#FEFAF9] rounded-2xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-[#6B6A6A]" />
            </div>
          )}

          <div className="flex-1">
            <h3 className="font-semibold text-[#2A2A2A] text-base group-hover:text-[#EB611F] transition-colors leading-snug">
              <Link
                to={`/job/${job?._id}`}
                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB611F]"
              >
                {job?.title}
              </Link>
            </h3>
            <p className="text-[#6B6A6A] text-sm flex items-center gap-2 mt-1">
              <Building className="w-3.5 h-3.5" />
              {job?.company?.companyName}
            </p>
          </div>
        </div>
        {!hideSave && user?.role === "jobseeker" && (
          <button
            type="button"
            className="p-2 hover:bg-[#FEFAF9] rounded-xl transition-colors"
            aria-label={t(job?.isSaved || saved ? "removeSavedJob" : "saveJob")}
            onClick={onToggleSave}
          >
            <Bookmark
              className={`w-5 h-5 hover:text-[#EB611F] ${
                job?.isSaved || saved ? "text-[#EB611F]" : "text-[#6B6A6A]"
              }`}
            />
          </button>
        )}
      </div>

      <div className="mb-5">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 bg-[#FEFAF9] text-[#6B6A6A] px-3 py-1 rounded-full font-medium">
            <MapPin className="w-3 h-3" />
            {job?.location}
          </span>
          <span
            className={`px-3 py-1 rounded-full font-medium ${
              job?.type === "Full-Time"
                ? "bg-green-100 text-green-800"
                : job.type === "Part-Time"
                ? "bg-yellow-100 text-yellow-800"
                : job.type === "Contract"
                ? "bg-purple-100 text-purple-800"
                : "bg-[#FEFAF9] text-[#6B6A6A]"
            }`}
          >
            {job?.type && t(
              job?.type === "Full-Time"
                ? "fullTime"
                : job?.type === "Part-Time"
                  ? "partTime"
                  : job?.type?.toLowerCase()
            )}
          </span>
          <span className="flex items-center gap-1.5 bg-[#FEFAF9] text-[#6B6A6A] px-3 py-1 rounded-full font-medium">
            {job?.category && t(job.category.toLowerCase())}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-medium text-[#6B6A6A] mb-5 pb-4 border-b border-[#FEFAF9]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {job?.createdAt
              ? new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                  dateStyle: "medium",
                }).format(new Date(job.createdAt))
              : t("notAvailable")}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[#EB611F] font-semibold text-lg">
          {formatSalaryRange(job, i18n.resolvedLanguage, t("notAvailable"))}
        </div>
        {!saved && (
          <>
            {job?.applicationStatus ? (
              <StatusBadge status={job?.applicationStatus} />
            ) : (
              !hideApply &&
              (!user || user.role === "jobseeker") && (
                <button
                  type="button"
                  className="bg-gradient-to-r from-[#FEFAF9] to-[#FEFAF9] text-sm text-[#EB611F] hover:text-white px-6 py-2.5 rounded-xl hover:from-[#EB611F] hover:to-[#EB611F] transition-all duration-200 font-semibold transform hover:-translate-y-0.5"
                  onClick={onApply}
                >
                  {t("applyNow")}
                </button>
              )
            )}
          </>
        )}
      </div>
    </article>
  );
};

export default JobCard;
