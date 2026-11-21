import { Download, X } from "lucide-react";
import { useState } from "react";
import { getInitials } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

import StatusBadge from "../StatusBadge";
import { useTranslation } from "react-i18next";
const statusOptions = ["Applied", "In Review", "Rejected", "Accepted"];
const statusTranslationKeys = {
  Applied: "applicationApplied",
  "In Review": "applicationInReview",
  Rejected: "applicationRejected",
  Accepted: "applicationAccepted",
};

const ApplicantProfilePreview = ({
  selectedApplicant,
  setSelectedApplicant,
  handleDownloadResume,
  handleClose,
}) => {
  const { t, i18n } = useTranslation();
  const [currentStatus, setCurrentStatus] = useState(selectedApplicant.status);
  const [loading, setLoading] = useState(false);

  const onChangeStatus = async (e) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    setLoading(true);

    try {
      const response = await axiosInstance.put(
        API_PATHS.APPLICATIONS.UPDATE_STATUS(selectedApplicant._id),
        { status: newStatus }
      );

      if (response.status === 200) {
        setSelectedApplicant({ ...selectedApplicant, status: newStatus });
        toast.success(t("applicationStatusUpdated"));
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setCurrentStatus(selectedApplicant.status);
      toast.error(t("tryAgain"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#FEF7F4]/95 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#FEFAF9]">
          <h3 className="text-lg font-semibold text-[#2A2A2A]">
            {t("applicantProfile")}
          </h3>
          <button
            onClick={() => handleClose()}
            className="p-2 hover:bg-[#FEFAF9] rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-[#6B6A6A]" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            {selectedApplicant.applicant.avatar ? (
              <img
                src={selectedApplicant.applicant.avatar}
                alt={selectedApplicant.applicant.name}
                className="h-20 w-20 rounded-full object-cover mx-auto"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-[#FEFAF9] flex items-center justify-center mx-auto">
                <span className="text-[#EB611F] font-semibold text-xl">
                  {getInitials(selectedApplicant.applicant.name)}
                </span>
              </div>
            )}
            <h4 className="mt-4 text-xl font-semibold text-[#2A2A2A]">
              {selectedApplicant.applicant.name}
            </h4>
            <p className="text-[#6B6A6A]">{selectedApplicant.applicant.email}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-[#FEFAF9] rounded-lg p-4">
              <h5 className="font-medium text-[#2A2A2A] mb-2">
                {t("appliedPosition")}
              </h5>
              <p className="text-[#6B6A6A]">{selectedApplicant.job.title}</p>
              <p className="text-[#6B6A6A] text-sm mt-1">
                {selectedApplicant.job.location} • {selectedApplicant.job.type && t(selectedApplicant.job.type === "Full-Time" ? "fullTime" : selectedApplicant.job.type === "Part-Time" ? "partTime" : selectedApplicant.job.type.toLowerCase())}
              </p>
            </div>

            <div className="bg-[#FEFAF9] rounded-lg p-4">
              <h5 className="font-medium text-[#2A2A2A] mb-2">
                {t("applicationDetails")}
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6B6A6A]">{t("statusLabel")}</span>
                  <StatusBadge status={currentStatus} />
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6A6A]">{t("appliedDate")}</span>
                  <span className="text-[#2A2A2A]">
                    {new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "medium" }).format(new Date(selectedApplicant.createdAt))}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                handleDownloadResume(selectedApplicant.applicant.resume)
              }
              disabled={!selectedApplicant.applicant?.resume}
              aria-label={
                selectedApplicant.applicant?.resume
                  ? t("resumeLabel")
                  : t("notAvailable")
              }
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#EB611F] text-white font-medium rounded-lg hover:bg-[#EB611F] transition-colors"
            >
              <Download className="h-4 w-4" />
              {t("downloadResume")}
            </button>

            {/* Status Dropdown */}
            <div className="mt-4">
              <label className="block mb-1 text-sm text-[#6B6A6A] font-medium">
                {t("changeApplicationStatus")}
              </label>
              <select
                value={currentStatus}
                onChange={onChangeStatus}
                disabled={loading}
                className="w-full border border-[#FEFAF9] rounded-lg p-2 focus:ring-[#EB611F] focus:border-[#EB611F]"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {t(statusTranslationKeys[status])}
                  </option>
                ))}
              </select>
              {loading && (
                <p className="text-xs text-[#6B6A6A] mt-1">{t("updatingStatus")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfilePreview;
