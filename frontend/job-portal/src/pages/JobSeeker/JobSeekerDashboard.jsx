import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Grid, List, X } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import FilterContent from "./components/FilterContent";
import SearchHeader from "./components/SearchHeader";
import Navbar from "../../components/layout/Navbar";
import JobCard from "../../components/Cards/JobCard";
import { useTranslation } from "react-i18next";

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    category: "",
    type: "",
    minSalary: "",
    maxSalary: "",
  });

  const [expandedSections, setExpandedSections] = useState({
    jobType: true,
    salary: true,
    categories: true,
  });

  const fetchJobs = useCallback(async (filterParams = {}) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filterParams.keyword) params.append("keyword", filterParams.keyword);
      if (filterParams.location) params.append("location", filterParams.location);
      if (filterParams.minSalary) params.append("minSalary", filterParams.minSalary);
      if (filterParams.maxSalary) params.append("maxSalary", filterParams.maxSalary);
      if (filterParams.type) params.append("type", filterParams.type);
      if (filterParams.category) params.append("category", filterParams.category);
      if (user) params.append("userId", user?._id);

      const response = await axiosInstance.get(
        `${API_PATHS.JOBS.GET_ALL_JOBS}?${params.toString()}`
      );

      const jobsData = Array.isArray(response.data)
        ? response.data
        : response.data.jobs || [];

      setJobs(jobsData);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      toast.error(t("tryAgain"));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const apiFilters = {
        keyword: filters.keyword,
        location: filters.location,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
        category: filters.category,
        type: filters.type,
      };

      const hasFilters = Object.values(apiFilters).some(
        (value) =>
          value !== "" &&
          value !== false &&
          value !== null &&
          value !== undefined
      );

      if (hasFilters) {
        fetchJobs(apiFilters);
      } else {
        fetchJobs();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchJobs, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const clearAllFilters = () => {
    setFilters({
      keyword: "",
      location: "",
      category: "",
      type: "",
      minSalary: "",
      maxSalary: "",
    });
  };

  const MobileFilterOverlay = () => (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${
        showMobileFilters ? "" : "hidden"
      }`}
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setShowMobileFilters(false)}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#FEF7F4]/95 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-[#FEFAF9]">
          <h3 className="font-bold text-[#2A2A2A] text-lg">{t("filters")}</h3>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="p-2 hover:bg-[#FEFAF9] hover:text-[#2A2A2A] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto h-full pb-20">
          <FilterContent
            toggleSection={toggleSection}
            clearAllFilters={clearAllFilters}
            expandedSections={expandedSections}
            filters={filters}
            handleFilterChange={handleFilterChange}
          />
        </div>
      </div>
    </div>
  );


 const toggleSaveJob = async (jobId, isSaved) => {
  try {
    if (isSaved) {
      await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
      toast.success(t("jobRemovedSuccess"));
    } else {
      await axiosInstance.post(API_PATHS.JOBS.SAVE_JOB(jobId));
      toast.success(t("jobSavedSuccess"));
    }

    fetchJobs();
  } catch (err) {
    console.error("Error saving job:", err);
    toast.error(t("tryAgain"));
  }
};

const applyToJob = async (jobId) => {
  try {
    if (jobId) {
      await axiosInstance.post(API_PATHS.APPLICATIONS.APPLY_TO_JOB(jobId));
      toast.success(t("applicationAppliedSuccess"));
    }

    fetchJobs();
  } catch (err) {
    console.error("Error applying to job:", err);
    const errorMsg = err?.response?.data?.message;
    toast.error(errorMsg || t("tryAgain"));
  }
};

if (jobs.length == 0 && loading) {
  return <LoadingSpinner />;
}

return (
  <div className="bg-gradient-to-br from-[#FEF7F4] via-white to-[#FBEDE6]">
    <Navbar />

    <div className="min-h-screen mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <SearchHeader
          filters={filters}
          handleFilterChange={handleFilterChange}
        />

        <div className="flex gap-6 lg:gap-8">
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-[#FEF7F4]/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[#FEFAF9]/20 p-6 sticky top-20">
              <h3 className="font-bold text-[#2A2A2A] text-xl mb-6">
                {t("filters")}
              </h3>
              <FilterContent
                toggleSection={toggleSection}
                clearAllFilters={clearAllFilters}
                expandedSections={expandedSections}
                filters={filters}
                handleFilterChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 gap-4">
              <div>
                <p className="text-[#6B6A6A] text-sm lg:text-base">
                  {t("showingRange", {
                    start: jobs.length === 0 ? 0 : 1,
                    end: jobs.length,
                    total: jobs.length,
                  })}
                </p>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-4">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#FEFAF9] font-medium text-[#6B6A6A] hover:bg-[#FEFAF9] transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  {t("filters")}
                </button>

                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="flex items-center border border-[#FEFAF9] rounded-xl p-1 bg-white">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "grid"
                          ? "bg-[#EB611F] text-white shadow-sm"
                          : "text-[#6B6A6A] hover:text-[#2A2A2A] hover:bg-[#FEFAF9]"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
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
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-16 lg:py-20 bg-[#FEF7F4]/60 backdrop-blur-xl rounded-2xl border border-[#FEFAF9]/20">
                <div className="text-[#A8A8A8] mb-6">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-[#2A2A2A] mb-3">
                  {t("noJobsFound")}
                </h3>
                <p className="text-[#6B6A6A] mb-6">
                  {t("adjustSearchFilters")}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-[#EB611F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#EB611F]/90 transition-colors"
                >
                  {t("clearAll")}
                </button>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6"
                      : "space-y-4 lg:space-y-6"
                  }
                >
                  {jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onClick={() => navigate(`/job/${job._id}`)}
                      onToggleSave={() => toggleSaveJob(job._id, job.isSaved)}
                      onApply={() => applyToJob(job._id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <MobileFilterOverlay />
    </div>
  </div>
);

}

export default JobSeekerDashboard;
