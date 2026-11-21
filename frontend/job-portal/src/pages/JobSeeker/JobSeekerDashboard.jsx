import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, Grid, List, X } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import FilterContent from "./components/FilterContent";
import SearchHeader from "./components/SearchHeader";
import Navbar from "../../components/layout/Navbar";
import JobCard from "../../components/Cards/JobCard";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const searchTimeoutRef = useRef(null);
  const mobileFilterPanelRef = useRef(null);

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
      setFetchError(false);

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
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  useEffect(() => {
    searchTimeoutRef.current = setTimeout(() => {
      const apiFilters = {
        keyword: filters.keyword,
        location: filters.location,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
        category: filters.category,
        type: filters.type,
      };

      fetchJobs(apiFilters);
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [fetchJobs, filters]);

  const handleSearch = () => {
    clearTimeout(searchTimeoutRef.current);
    fetchJobs(filters);
  };

  useEffect(() => {
    if (!showMobileFilters) return undefined;

    mobileFilterPanelRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setShowMobileFilters(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMobileFilters]);

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
      <button
        type="button"
        aria-label={t("closeMenu")}
        className="fixed inset-0 h-full w-full bg-black/50"
        onClick={() => setShowMobileFilters(false)}
      />
      <div
        ref={mobileFilterPanelRef}
        id="mobile-filters-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filters-title"
        tabIndex={-1}
        className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#FEF7F4]/95 shadow-xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#FEFAF9]">
          <h3
            id="mobile-filters-title"
            className="font-bold text-[#2A2A2A] text-lg"
          >
            {t("filters")}
          </h3>
          <button
            type="button"
            onClick={() => setShowMobileFilters(false)}
            aria-label={t("closeMenu")}
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

    fetchJobs(filters);
  } catch (err) {
    console.error("Error saving job:", err);
    toast.error(t("tryAgain"));
  }
};

const applyToJob = async (jobId) => {
  if (!user) {
    navigate("/login", { state: { from: location } });
    return;
  }

  if (user.role !== "jobseeker") return;

  try {
    if (jobId) {
      await axiosInstance.post(API_PATHS.APPLICATIONS.APPLY_TO_JOB(jobId));
      toast.success(t("applicationAppliedSuccess"));
    }

    fetchJobs(filters);
  } catch (err) {
    console.error("Error applying to job:", err);
    const errorMsg = err?.response?.data?.message;
    toast.error(errorMsg || t("tryAgain"));
  }
};

if (jobs.length === 0 && loading) {
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
          onSearch={handleSearch}
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
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  aria-expanded={showMobileFilters}
                  aria-controls="mobile-filters-panel"
                  aria-label={t("filters")}
                  className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#FEFAF9] font-medium text-[#6B6A6A] hover:bg-[#FEFAF9] transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  {t("filters")}
                </button>

                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="flex items-center border border-[#FEFAF9] rounded-xl p-1 bg-white">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      aria-label={t("gridView")}
                      aria-pressed={viewMode === "grid"}
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
                      aria-pressed={viewMode === "list"}
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

            {fetchError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700"
              >
                <p>{t("tryAgain")}</p>
                <button
                  type="button"
                  onClick={() => fetchJobs(filters)}
                  className="mt-2 font-semibold underline"
                >
                  {t("retry")}
                </button>
              </div>
            )}

            {jobs.length === 0 && !fetchError ? (
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
                  type="button"
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
