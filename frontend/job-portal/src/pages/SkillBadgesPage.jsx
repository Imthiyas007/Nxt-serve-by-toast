import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/useAuth";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const SkillBadgesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [catalog, setCatalog] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [pendingBadges, setPendingBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState("");
  const [loading, setLoading] = useState(true);

  const loadBadges = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.role === "employer") {
        const response = await axiosInstance.get(API_PATHS.BADGES.PENDING);
        setPendingBadges(response.data);
      } else {
        const [catalogResponse, badgesResponse] = await Promise.all([
          axiosInstance.get(API_PATHS.BADGES.CATALOG),
          axiosInstance.get(API_PATHS.BADGES.MINE),
        ]);
        setCatalog(catalogResponse.data);
        setMyBadges(badgesResponse.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t("tryAgain"));
    } finally {
      setLoading(false);
    }
  }, [t, user?.role]);

  useEffect(() => {
    void loadBadges();
  }, [loadBadges]);

  const requestBadge = async (event) => {
    event.preventDefault();
    if (!selectedBadge) return;
    try {
      await axiosInstance.post(API_PATHS.BADGES.REQUEST, { name: selectedBadge });
      setSelectedBadge("");
      await loadBadges();
      toast.success(t("badgeRequested"));
    } catch (error) {
      toast.error(error.response?.data?.message || t("tryAgain"));
    }
  };

  const verifyBadge = async (badgeId) => {
    try {
      await axiosInstance.post(API_PATHS.BADGES.VERIFY(badgeId));
      await loadBadges();
      toast.success(t("badgeVerified"));
    } catch (error) {
      toast.error(error.response?.data?.message || t("tryAgain"));
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF7F4]/95">
      <Navbar />
      <main className="mx-auto max-w-4xl space-y-6 px-4 pb-12 pt-24">
        <header>
          <h1 className="text-2xl font-semibold text-[#2A2A2A]">
            {t("skillBadges")}
          </h1>
          <p className="mt-1 text-sm text-[#6B6A6A]">{t("skillBadgesHelp")}</p>
        </header>

        {loading ? (
          <p role="status">{t("loading")}</p>
        ) : user?.role === "employer" ? (
          <section className="space-y-3">
            <h2 className="font-semibold text-[#2A2A2A]">{t("badgeRequests")}</h2>
            {pendingBadges.length === 0 ? (
              <p className="rounded-xl bg-white p-5 text-[#6B6A6A]">
                {t("noBadgeRequests")}
              </p>
            ) : (
              pendingBadges.map((badge) => (
                <article
                  key={badge._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4"
                >
                  <div>
                    <p className="font-semibold text-[#2A2A2A]">{badge.name}</p>
                    <p className="text-sm text-[#6B6A6A]">
                      {badge.user?.name} · {badge.user?.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => verifyBadge(badge._id)}
                    className="rounded-lg bg-[#EB611F] px-4 py-2 font-semibold text-white"
                  >
                    {t("verifyBadge")}
                  </button>
                </article>
              ))
            )}
          </section>
        ) : (
          <>
            <form
              onSubmit={requestBadge}
              className="flex flex-col gap-3 rounded-xl bg-white p-4 sm:flex-row"
            >
              <label className="sr-only" htmlFor="badge-select">
                {t("badgeCatalog")}
              </label>
              <select
                id="badge-select"
                value={selectedBadge}
                onChange={(event) => setSelectedBadge(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-[#D8D1CE] px-3 py-2"
              >
                <option value="">{t("badgeCatalog")}</option>
                {catalog.map((badge) => (
                  <option
                    key={badge}
                    value={badge}
                    disabled={myBadges.some((item) => item.name === badge)}
                  >
                    {badge}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!selectedBadge}
                className="rounded-lg bg-[#EB611F] px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                {t("requestBadge")}
              </button>
            </form>

            <section className="space-y-3">
              <h2 className="font-semibold text-[#2A2A2A]">{t("myBadges")}</h2>
              {myBadges.length === 0 ? (
                <p className="rounded-xl bg-white p-5 text-[#6B6A6A]">
                  {t("noBadges")}
                </p>
              ) : (
                myBadges.map((badge) => (
                  <article
                    key={badge._id}
                    className="flex items-center justify-between rounded-xl bg-white p-4"
                  >
                    <span className="font-medium text-[#2A2A2A]">{badge.name}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        badge.status === "verified"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {badge.status === "verified"
                        ? t("verified")
                        : t("pendingVerification")}
                    </span>
                  </article>
                ))
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default SkillBadgesPage;
