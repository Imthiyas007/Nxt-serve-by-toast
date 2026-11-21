import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit,
  X,
  Trash2,
  ChevronUp,
  ChevronDown,
  Users,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useTranslation } from "react-i18next";

const ManageJobs = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const itemsPerPage = 8;
  const [jobs, setJobs] = useState([]);

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter((job) => {
      const matchesSearch =
        (job.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.company || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "applicants") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [jobs, searchTerm, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredAndSortedJobs.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleStatusChange = async (jobId) => {
    try {
      await axiosInstance.put(API_PATHS.JOBS.TOGGLE_CLOSE(jobId));
      await getPostedJobs();
    } catch (error) {
      console.error("Error toggling job status:", error);
      toast.error(t("tryAgain"));
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axiosInstance.delete(API_PATHS.JOBS.DELETE_JOB(jobId));
      setJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
      toast.success(t("jobDeletedSuccess"));
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error(t("tryAgain"));
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ChevronUp className="w-4 h-4 text-[#6B6A6A]" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-[#EB611F]" />
    ) : (
      <ChevronDown className="w-4 h-4 text-[#EB611F]" />
    );
  };

  const LoadingRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#FEFAF9] rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-[#FEFAF9] rounded w-32"></div>
            <div className="h-3 bg-[#FEFAF9] rounded w-24"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-[#FEFAF9] rounded-full w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-[#FEFAF9] rounded w-12"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <div className="h-8 bg-[#FEFAF9] rounded w-16"></div>
          <div className="h-8 bg-[#FEFAF9] rounded w-16"></div>
          <div className="h-8 bg-[#FEFAF9] rounded w-16"></div>
        </div>
      </td>
    </tr>
  );

  const getPostedJobs = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_JOBS_EMPLOYER);
      if (!Array.isArray(response.data)) {
        throw new Error("Employer jobs response was not a list");
      }
      const formattedJobs = response.data.map((job) => ({
        id: job._id,
        title: job.title,
        company: job.company?.name,
        status: job.isClosed ? "Closed" : "Active",
        applicants: job.applicationCount || 0,
        datePosted: moment(job.createdAt).format("DD-MM-YYYY"),
        logo: job.company?.companyLogo,
      }));
      setJobs(formattedJobs);
    } catch (error) {
      console.error("Error fetching employer jobs:", error);
      setLoadError(true);
      toast.error(t("tryAgain"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    getPostedJobs();
  }, [getPostedJobs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(totalPages, 1)));
  }, [totalPages]);
    return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#FEF7F4]/95">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-row items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-xl md:text-2xl font-semibold text-[#2A2A2A]">
                  {t("jobManagement")}
                </h1>
                <p className="text-sm text-[#6B6A6A] mt-1">
                  {t("manageJobPostings")}
                </p>
              </div>

              <button
                className="inline-flex items-center px-6 py-3 bg-[#EB611F] hover:bg-[#d4551b] text-sm text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap"
                onClick={() => navigate("/post-job")}
              >
                <Plus className="w-5 h-5 mr-2" />
                {t("addNewJob")}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#FEF7F4]/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/5 border border-[#FEFAF9] p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#6B6A6A]" />
                </div>
                <input
                  type="text"
                  placeholder={t("searchJobsPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 text-sm border border-[#FEFAF9] rounded-lg focus:ring-2 focus:ring-[#EB611F]/20 focus:border-[#EB611F] outline-0 transition-all duration-200 bg-[#FEFAF9] placeholder-[#6B6A6A]"
                />
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-4 py-2 text-sm border border-[#FEFAF9] rounded-lg focus:ring-2 focus:ring-[#EB611F]/20 focus:border-[#EB611F] transition-all duration-200 bg-[#FEFAF9] text-[#2A2A2A]"
                >
                  <option value="All">{t("allStatus")}</option>
                  <option value="Active">{t("active")}</option>
                  <option value="Closed">{t("closed")}</option>
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="my-4">
              <p className="text-sm text-[#6B6A6A]">
                {t("showingRange", {
                  start: filteredAndSortedJobs.length === 0 ? 0 : startIndex + 1,
                  end: startIndex + paginatedJobs.length,
                  total: filteredAndSortedJobs.length,
                })}
              </p>
            </div>

            {/* Table */}
            <div className="bg-[#FEF7F4]/95 backdrop-blur-sm rounded-2xl border border-[#FEFAF9] overflow-hidden">
              {loadError && !isLoading ? (
                <div role="alert" className="py-12 text-center">
                  <p className="text-[#6B6A6A]">{t("tryAgain")}</p>
                  <button
                    type="button"
                    className="mt-4 rounded-lg bg-[#EB611F] px-4 py-2 font-semibold text-white"
                    onClick={getPostedJobs}
                  >
                    {t("retry")}
                  </button>
                </div>
              ) : filteredAndSortedJobs.length === 0 && !isLoading ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-[#FEFAF9] rounded-full flex items-center justify-center mb-4">
                    <Search className="w-10 h-10 text-[#6B6A6A]" />
                  </div>
                  <h3 className="text-lg font-medium text-[#2A2A2A] mb-2">
                    {t("noJobsFound")}
                  </h3>
                  <p className="text-[#6B6A6A]">
                    {t("adjustSearchFilters")}
                  </p>
                </div>
              ) : (
                <div className="w-[75vw] md:w-full overflow-x-auto scrollbar-thin scrollbar-thumb-[#EB611F]/30 scrollbar-track-[#FEFAF9]">
                  <table className="min-w-full divide-y divide-[#FEFAF9]">
                    <thead className="bg-gradient-to-r from-[#FEFAF9] to-[#FEF7F4]">
                      <tr>
                        {["title", "status", "applicants"].map((field) => (
                          <th
                            key={field}
                            aria-sort={
                              sortField === field
                                ? sortDirection === "asc"
                                  ? "ascending"
                                  : "descending"
                                : "none"
                            }
                            className="px-6 py-4 text-left text-xs font-semibold text-[#6B6A6A] uppercase tracking-wider cursor-pointer hover:bg-[#FEFAF9] transition-all duration-200"
                          >
                            <button
                              type="button"
                              onClick={() => handleSort(field)}
                              className="flex items-center gap-1 text-left"
                            >
                              <span>{t(field === "title" ? "jobTitleLabel" : field === "status" ? "statusLabel" : "applicants").replace(/:$/, "")}</span>
                              <SortIcon field={field} />
                            </button>
                          </th>
                        ))}
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B6A6A] uppercase tracking-wider">
                          {t("actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#FEFAF9] divide-y divide-[#FEFAF9]">
                                            {isLoading
                        ? Array.from({ length: 5 }).map((_, index) => (
                            <LoadingRow key={index} />
                          ))
                        : paginatedJobs.map((job) => (
                            <tr
                              key={job.id}
                              className="hover:bg-[#FEFAF9] transition-all duration-200 border-b border-[#FEFAF9]"
                            >
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-semibold text-[#2A2A2A]">
                                    {job.title}
                                  </div>
                                  <div className="text-xs text-[#6B6A6A] font-medium">
                                    {job.company}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                                    job.status === "Active"
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      : "bg-[#FEFAF9] text-[#6B6A6A] border border-[#FEFAF9]"
                                  }`}
                                >
                                  {t(job.status.toLowerCase())}
                                </span>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <button
                                  className="flex items-center text-sm text-[#EB611F] hover:text-[#d4551b] font-semibold transition-colors duration-200 hover:bg-[#FEFAF9] px-2 py-1 rounded-lg"
                                  onClick={() =>
                                    navigate("/applicants", {
                                      state: { jobId: job.id },
                                    })
                                  }
                                >
                                  <Users className="w-4 h-4 mr-1.5" />
                                  {job.applicants}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    className="text-[#EB611F] hover:text-[#d4551b] p-2 rounded-lg hover:bg-[#FEFAF9] transition-colors duration-200"
                                    aria-label={t("editJob")}
                                    onClick={() =>
                                      navigate("/post-job", {
                                        state: { jobId: job.id },
                                      })
                                    }
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>

                                  {job.status === "Active" ? (
                                    <button
                                      onClick={() => handleStatusChange(job.id)}
                                      className="flex items-center gap-2 text-xs text-[#EB611F] hover:text-[#d4551b] p-2 rounded-lg hover:bg-[#FEFAF9] transition-colors duration-200"
                                    >
                                      <X className="w-4 h-4" />
                                      <span className="hidden sm:inline">{t("closeJob")}</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleStatusChange(job.id)}
                                      className="flex items-center gap-2 text-xs text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors duration-200"
                                    >
                                      <Plus className="w-4 h-4" />
                                      <span className="hidden sm:inline">{t("activateJob")}</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleDeleteJob(job.id)}
                                    aria-label={t("deleteJob")}
                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-[#FEFAF9] text-sm font-medium rounded-md text-[#2A2A2A] bg-[#FEF7F4]/95 hover:bg-[#FEFAF9] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("previous")}
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-[#FEFAF9] text-sm font-medium rounded-md text-[#2A2A2A] bg-[#FEF7F4]/95 hover:bg-[#FEFAF9] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("next")}
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[#6B6A6A]">
                      {t("showingRange", {
                        start: filteredAndSortedJobs.length === 0 ? 0 : startIndex + 1,
                        end: Math.min(startIndex + itemsPerPage, filteredAndSortedJobs.length),
                        total: filteredAndSortedJobs.length,
                      })}
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#FEFAF9] bg-[#FEF7F4]/95 text-sm font-medium text-[#6B6A6A] hover:bg-[#FEFAF9] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t("previous")}
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? "z-10 bg-[#EB611F]/10 border-[#EB611F] text-[#EB611F]"
                              : "bg-[#FEF7F4]/95 border-[#FEFAF9] text-[#6B6A6A] hover:bg-[#FEFAF9]"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#FEFAF9] bg-[#FEF7F4]/95 text-sm font-medium text-[#6B6A6A] hover:bg-[#FEFAF9] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t("next")}
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageJobs;
