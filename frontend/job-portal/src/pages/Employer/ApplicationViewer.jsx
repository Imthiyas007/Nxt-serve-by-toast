import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Calendar,
  MapPin,
  Briefcase,
  Download,
  Eye,
  ArrowLeft,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useLocation, useNavigate } from "react-router-dom";
import { getInitials } from "../../utils/helper";

import DashboardLayout from '../../components/layout/DashboardLayout'
import StatusBadge from "../../components/StatusBadge";
import ApplicantProfilePreview from "../../components/Cards/ApplicantProfilePreview";
import { useTranslation } from "react-i18next";

const ApplicationViewer = () => {
  const location = useLocation();
  const jobId = location.state?.jobId || null;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const response = await axiosInstance.get(
        API_PATHS.APPLICATIONS.GET_ALL_APPLICATIONS(jobId)
      );
      if (!Array.isArray(response.data)) {
        throw new Error("Applications response was not a list");
      }
      setApplications(response.data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) fetchApplications();
    else navigate("/manage-jobs");
  }, [fetchApplications, jobId, navigate]);

  const groupedApplications = useMemo(() => {
    const filtered = applications.filter(
      (app) => app.job && app.job.title && app.applicant
    );
    return filtered.reduce((acc, app) => {
      const jobId = app.job._id;
      if (!acc[jobId]) {
        acc[jobId] = {
          job: app.job,
          applications: [],
        };
      }
      acc[jobId].applications.push(app);
      return acc;
    }, {});
  }, [applications]);

  const handleDownloadResume = (resumeUrl) => {
    try {
      const url = new URL(resumeUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("Unsupported resume URL protocol");
      }
      window.open(url.href, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Unable to open applicant resume:", error);
    }
  };

  return (
    <DashboardLayout activeMenu='manage-jobs'>
      {loading ? (
        <div className="min-h-screen bg-[#FEF7F4]/95 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EB611F] mx-auto"></div>
            <p className="mt-4 text-[#6B6A6A]">{t("loadingApplications")}</p>
          </div>
        </div>
      ) : loadError ? (
        <div
          role="alert"
          className="min-h-screen bg-[#FEF7F4]/95 flex flex-col items-center justify-center gap-4"
        >
          <p className="text-[#6B6A6A]">{t("tryAgain")}</p>
          <button
            type="button"
            onClick={fetchApplications}
            className="rounded-lg bg-[#EB611F] px-4 py-2 font-semibold text-white"
          >
            {t("retry")}
          </button>
        </div>
      ) : (
      <div className="min-h-screen bg-[#FEF7F4]/95">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <button
                onClick={() => navigate("/manage-jobs")}
                className="group flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#6B6A6A] hover:text-[#2A2A2A] bg-[#FEF7F4]/95 hover:bg-[#FEFAF9] border border-[#FEFAF9] hover:border-transparent rounded-xl transition-all duration-300 shadow-lg shadow-[#FEFAF9] hover:shadow-xl"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>{t("back")}</span>
              </button>

              <h1 className="text-xl md:text-2xl font-semibold text-[#2A2A2A]">
                {t("applicationsOverview")}
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 pb-8">
          {Object.keys(groupedApplications).length === 0 ? (
            <div className="text-center py-16">
              <Users className="mx-auto h-24 w-24 text-[#FEFAF9]" />
              <h3 className="mt-4 text-lg font-medium text-[#2A2A2A]">
                {t("noApplicationsAvailable")}
              </h3>
              <p className="mt-2 text-[#6B6A6A]">
                {t("noApplicationsFound")}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.values(groupedApplications).map(
                ({ job, applications }) => (
                  <div
                    key={job._id}
                    className="bg-[#FEF7F4]/95 rounded-xl shadow-md overflow-hidden"
                  >
                    <div className="bg-[#EB611F] px-6 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-[#FEFAF9]">
                            {job.title}
                          </h2>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-[#FEFAF9]">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              <span className="text-sm">{job.type && t(job.type === "Full-Time" ? "fullTime" : job.type === "Part-Time" ? "partTime" : job.type.toLowerCase())}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm">{job.category && t(job.category.toLowerCase())}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-[#FEF7F4]/95 backdrop-blur-sm rounded-lg px-3 py-2">
                          <span className="text-sm text-[#2A2A2A] font-medium">
                            {t("applicationCount", { total: applications.length })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="space-y-4">
                        {applications.map((application) => (
                          <div
                            key={application._id}
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-[#FEFAF9] rounded-lg hover:bg-[#FEFAF9] transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                {application.applicant.avatar ? (
                                  <img
                                    src={application.applicant.avatar}
                                    alt={application.applicant.name}
                                    className="h-12 w-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-full bg-[#FEFAF9] flex items-center justify-center">
                                    <span className="text-[#EB611F] font-semibold">
                                      {getInitials(application.applicant.name)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-[#2A2A2A]">
                                  {application.applicant.name}
                                </h3>
                                <p className="text-[#6B6A6A] text-sm">
                                  {application.applicant.email}
                                </p>
                                <div className="flex items-center gap-1 mt-1 text-[#6B6A6A] text-xs">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {t("appliedOn", {
                                      date: new Intl.DateTimeFormat(
                                        i18n.resolvedLanguage,
                                        { dateStyle: "medium" }
                                      ).format(new Date(application.createdAt)),
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mt-4 md:m-0">
                              <StatusBadge status={application.status} />
                              <button
                                type="button"
                                onClick={() =>
                                  handleDownloadResume(
                                    application.applicant.resume
                                  )
                                }
                                disabled={!application.applicant?.resume}
                                aria-label={
                                  application.applicant?.resume
                                    ? t("resumeLabel")
                                    : t("notAvailable")
                                }
                                className="inline-flex items-center gap-2 px-3 py-2 bg-[#EB611F] text-[#FEFAF9] text-sm font-medium rounded-lg hover:bg-[#EB611F] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Download className="h-4 w-4" />
                                {t("resumeLabel")}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedApplicant(application)
                                }
                                className="inline-flex items-center gap-2 px-3 py-2 bg-[#FEFAF9] text-[#2A2A2A] text-sm font-medium rounded-lg hover:bg-[#FEFAF9] transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                                {t("viewProfile")}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {selectedApplicant && (
          <ApplicantProfilePreview
            selectedApplicant={selectedApplicant}
            setSelectedApplicant={setSelectedApplicant}
            handleDownloadResume={handleDownloadResume}
            handleClose={() => {
              setSelectedApplicant(null);
              fetchApplications();
            }}
          />
        )}
      </div>
      )}
    </DashboardLayout>
  );
};

export default ApplicationViewer;
