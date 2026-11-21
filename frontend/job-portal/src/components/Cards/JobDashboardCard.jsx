import { Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";

const JobDashboardCard = ({ job }) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-[#FEFAF9] hover:border-[#FEFAF9] transition-colors bg-[#FEF7F4]/95">
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 bg-[#FEFAF9] rounded-xl flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-[#EB611F]" />
        </div>
        <div>
          <h4 className="text-[15px] font-medium text-[#2A2A2A]">{job.title}</h4>
          <p className="text-xs text-[#6B6A6A]">
            {job.location} • {new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "medium" }).format(new Date(job.createdAt))}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            !job.isClosed
              ? "bg-green-100 text-green-700"
              : "bg-[#FEFAF9] text-[#6B6A6A]"
          }`}
        >
          {job.isClosed ? t("closed") : t("active")}
        </span>
      </div>
    </div>
  );
};

export default JobDashboardCard;
