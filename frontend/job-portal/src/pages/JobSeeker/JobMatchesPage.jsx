import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import JobCard from "../../components/Cards/JobCard";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const JobMatchesPage = () => {
  const { t } = useTranslation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const findMatches = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get(API_PATHS.AI.MATCHES);
      setMatches(response.data);
    } catch (requestError) {
      const message = requestError.response?.data?.message || t("tryAgain");
      setError(message);
      if (requestError.response?.status !== 400) toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void findMatches();
  }, [findMatches]);

  return (
    <DashboardLayout activeMenu="matches">
      <main className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#2A2A2A]">
              {t("jobMatches")}
            </h1>
            <p className="mt-1 text-sm text-[#6B6A6A]">{t("jobMatchesHelp")}</p>
          </div>
          <button
            type="button"
            onClick={findMatches}
            disabled={loading}
            className="rounded-lg bg-[#EB611F] px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {t("findMatches")}
          </button>
        </header>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div role="alert" className="rounded-xl bg-white p-6 text-center">
            <p className="text-[#6B6A6A]">{error}</p>
            {error.includes("skills") && (
              <Link
                to="/profile"
                className="mt-3 inline-block font-semibold text-[#EB611F] underline"
              >
                {t("editSkills")}
              </Link>
            )}
          </div>
        ) : matches.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-[#6B6A6A]">
            {t("noMatches")}
          </p>
        ) : (
          <div className="space-y-5">
            {matches.map(({ job, score, explanation }) => (
              <article key={job._id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-[#2A2A2A]">
                    {t("matchExplanation")}
                  </h2>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    {t("matchScore", { score })}
                  </span>
                </div>
                <p className="mb-3 text-sm text-[#6B6A6A]">{explanation}</p>
                <JobCard job={job} hideApply hideSave />
              </article>
            ))}
          </div>
        )}
      </main>
    </DashboardLayout>
  );
};

export default JobMatchesPage;
