import {
  ArrowLeft,
  Bookmark,
  Grid,
  List,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useCallback, useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import JobCard from "../../components/Cards/JobCard";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../components/LoadingSpinner";

const SavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [savedJobList, setSavedJobList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const getSavedJobs = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_SAVED_JOBS);
      if (!Array.isArray(response.data)) {
        throw new Error("Saved jobs response was not a list");
      }
      setSavedJobList(response.data);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      setLoadError(true);
      toast.error(t("tryAgain"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleUnsaveJob = async (jobId) => {
    try {
      await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
      toast.success(t("jobRemovedSuccess"));
      getSavedJobs();
    } catch (error) {
      console.error("Error removing saved job:", error);
      toast.error(t("tryAgain"));
    }
  };

  useEffect(() => {
    if (user) {
      getSavedJobs();
    }
  }, [getSavedJobs, user]);

  return (
    <div className="bg-[#FEF7F4]/95">
      <Navbar />
      <div className="container mx-auto pt-24">
        {loading ? (
          <LoadingSpinner />
        ) : loadError ? (
          <div
            role="alert"
            className="rounded-xl bg-white p-8 text-center text-[#6B6A6A]"
          >
            <p>{t("tryAgain")}</p>
            <button
              type="button"
              onClick={getSavedJobs}
              className="mt-4 rounded-lg bg-[#EB611F] px-4 py-2 font-semibold text-white"
            >
              {t("retry")}
            </button>
          </div>
        ) : (
          <div className="bg-[#FEFAF9] p-6 rounded-2xl border border-[#FEFAF9] shadow-md">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  aria-label={t("back")}
                  className="group flex items-center space-x-2 px-3.5 py-2.5 text-sm font-medium text-[#6B6A6A] hover:text-[#2A2A2A] bg-[#FEFAF9] hover:bg-[#EB611F]/10 border border-[#FEFAF9] hover:border-transparent rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </button>
                <h1 className="text-lg lg:text-xl font-semibold leading-tight text-[#2A2A2A]">
                  {t("savedJobs")}
                </h1>
              </div>

              <div className="flex items-center gap-3 lg:gap-4">
                <div className="flex items-center border border-[#FEFAF9] rounded-xl p-1 bg-[#FEFAF9]">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label={t("gridView")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "grid"
                        ? "bg-[#EB611F] text-white shadow-sm"
                        : "text-[#6B6A6A] hover:text-[#2A2A2A] hover:bg-[#FEFAF9]"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-label={t("listView")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "list"
                        ? "bg-[#EB611F] text-white shadow-sm"
                        : "text-[#6B6A6A] hover:text-[#2A2A2A] hover:bg-[#FEFAF9]"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content sections */}
            <div className="px-0 pb-8 space-y-8">
              {savedJobList.length === 0 ? (
                <div className="text-center py-16 lg:py-20 bg-[#FEFAF9]/60 backdrop-blur-xl rounded-2xl border border-[#FEFAF9]">
                  <div className="text-[#EB611F]/30 mb-6">
                    <Bookmark className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-[#2A2A2A] mb-3">
                    {t("noSavedJobs")}
                  </h3>
                  <p className="text-[#6B6A6A] mb-6">
                    {t("savedJobsPrompt")}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/find-jobs`)}
                    className="bg-[#EB611F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#d4551b] transition-colors"
                  >
                    {t("searchJobs")}
                  </button>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6"
                      : "space-y-4 lg:space-y-6"
                  }
                >
                  {savedJobList.map((savedJob) => {
                    const jobData = savedJob?.job || savedJob;
                    return (
                      <JobCard
                        key={jobData._id}
                        job={jobData}
                        onToggleSave={() => handleUnsaveJob(jobData._id)}
                        saved
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
