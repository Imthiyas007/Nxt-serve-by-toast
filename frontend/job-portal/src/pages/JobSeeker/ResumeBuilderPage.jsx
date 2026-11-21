import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/useAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const emptyEntry = {
  title: "",
  organization: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
};

const ResumeBuilderPage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [resume, setResume] = useState({
    summary: user?.resumeProfile?.summary || "",
    experience: user?.resumeProfile?.experience || [],
    education: user?.resumeProfile?.education || [],
  });
  const [template, setTemplate] = useState("modern");
  const [saving, setSaving] = useState(false);

  const updateEntry = (section, index, field, value) => {
    setResume((current) => ({
      ...current,
      [section]: current[section].map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry
      ),
    }));
  };

  const addEntry = (section) => {
    setResume((current) => ({
      ...current,
      [section]: [...current[section], { ...emptyEntry }],
    }));
  };

  const removeEntry = (section, index) => {
    setResume((current) => ({
      ...current,
      [section]: current[section].filter((_, entryIndex) => entryIndex !== index),
    }));
  };

  const saveResume = async () => {
    setSaving(true);
    try {
      await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
        resumeProfile: resume,
      });
      updateUser({ resumeProfile: resume });
      toast.success(t("profileUpdated"));
    } catch (error) {
      toast.error(error.response?.data?.message || t("tryAgain"));
    } finally {
      setSaving(false);
    }
  };

  const renderEntryFields = (section, entry, index) => (
    <fieldset
      key={`${section}-${index}`}
      className="space-y-3 rounded-xl border border-[#E8E1DD] bg-white p-4"
    >
      <legend className="px-2 font-semibold text-[#2A2A2A]">
        {section === "experience"
          ? `${t("workExperience")} ${index + 1}`
          : `${t("education")} ${index + 1}`}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["title", section === "experience" ? t("jobTitleLabel") : t("degree")],
          ["organization", section === "experience" ? t("companyName") : t("school")],
          ["location", t("location")],
          ["startDate", t("startDate")],
          ["endDate", t("endDate")],
        ].map(([field, label]) => (
          <label key={field} className="space-y-1 text-sm font-medium text-[#2A2A2A]">
            <span>{label}</span>
            <input
              value={entry[field] || ""}
              onChange={(event) =>
                updateEntry(section, index, field, event.target.value)
              }
              maxLength={120}
              className="w-full rounded-lg border border-[#D8D1CE] px-3 py-2"
            />
          </label>
        ))}
      </div>
      <label className="block space-y-1 text-sm font-medium text-[#2A2A2A]">
        <span>{t("description")}</span>
        <textarea
          value={entry.description || ""}
          onChange={(event) =>
            updateEntry(section, index, "description", event.target.value)
          }
          maxLength={2000}
          rows={3}
          className="w-full rounded-lg border border-[#D8D1CE] px-3 py-2"
        />
      </label>
      <button
        type="button"
        onClick={() => removeEntry(section, index)}
        className="text-sm font-semibold text-red-700 underline"
      >
        {t("remove")}
      </button>
    </fieldset>
  );

  const skills = user?.skills || [];

  return (
    <div className="min-h-screen bg-[#FEF7F4]/95">
      <div className="print:hidden">
        <Navbar />
      </div>
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <h1 className="text-2xl font-semibold text-[#2A2A2A]">
              {t("resumeBuilder")}
            </h1>
            <p className="mt-1 text-sm text-[#6B6A6A]">{t("resumeBuilderHelp")}</p>
          </div>
          <Link to="/matches" className="font-semibold text-[#EB611F] underline">
            {t("jobMatches")}
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-5 print:hidden">
            <label className="block space-y-2 font-medium text-[#2A2A2A]">
              <span>{t("resumeTemplate")}</span>
              <select
                value={template}
                onChange={(event) => setTemplate(event.target.value)}
                className="w-full rounded-lg border border-[#D8D1CE] bg-white px-3 py-2"
              >
                <option value="modern">{t("modernTemplate")}</option>
                <option value="classic">{t("classicTemplate")}</option>
              </select>
            </label>

            <label className="block space-y-2 font-medium text-[#2A2A2A]">
              <span>{t("resumeSummary")}</span>
              <textarea
                value={resume.summary}
                onChange={(event) =>
                  setResume((current) => ({
                    ...current,
                    summary: event.target.value,
                  }))
                }
                maxLength={2000}
                rows={4}
                className="w-full rounded-lg border border-[#D8D1CE] bg-white px-3 py-2"
              />
            </label>

            <section className="space-y-3">
              <h2 className="font-semibold text-[#2A2A2A]">{t("workExperience")}</h2>
              {resume.experience.map((entry, index) =>
                renderEntryFields("experience", entry, index)
              )}
              <button
                type="button"
                onClick={() => addEntry("experience")}
                className="rounded-lg border border-[#EB611F] px-3 py-2 text-sm font-semibold text-[#EB611F]"
              >
                {t("addExperience")}
              </button>
            </section>

            <section className="space-y-3">
              <h2 className="font-semibold text-[#2A2A2A]">{t("education")}</h2>
              {resume.education.map((entry, index) =>
                renderEntryFields("education", entry, index)
              )}
              <button
                type="button"
                onClick={() => addEntry("education")}
                className="rounded-lg border border-[#EB611F] px-3 py-2 text-sm font-semibold text-[#EB611F]"
              >
                {t("addEducation")}
              </button>
            </section>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveResume}
                disabled={saving}
                className="rounded-lg bg-[#EB611F] px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                {saving ? t("saving") : t("saveResume")}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg border border-[#EB611F] px-4 py-2 font-semibold text-[#EB611F]"
              >
                {t("downloadPdf")}
              </button>
            </div>
          </section>

          <article
            className={`resume-print min-h-[10in] bg-white p-8 shadow-lg ${
              template === "classic" ? "font-serif" : "font-sans"
            }`}
          >
            <header className="border-b-2 border-[#EB611F] pb-5">
              <h2 className="text-3xl font-bold text-[#2A2A2A]">{user?.name}</h2>
              <p className="mt-1 text-sm text-[#6B6A6A]">{user?.email}</p>
            </header>
            {resume.summary && (
              <section className="mt-6">
                <h3 className="font-bold uppercase tracking-wide text-[#EB611F]">
                  {t("resumeSummary")}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#3A3A3A]">
                  {resume.summary}
                </p>
              </section>
            )}
            {skills.length > 0 && (
              <section className="mt-6">
                <h3 className="font-bold uppercase tracking-wide text-[#EB611F]">
                  {t("skills")}
                </h3>
                <p className="mt-2 text-sm text-[#3A3A3A]">{skills.join(" · ")}</p>
              </section>
            )}
            {["experience", "education"].map((section) => (
              <section key={section} className="mt-6">
                <h3 className="font-bold uppercase tracking-wide text-[#EB611F]">
                  {t(section === "experience" ? "workExperience" : "education")}
                </h3>
                <div className="mt-3 space-y-4">
                  {resume[section].map((entry, index) => (
                    <div key={`${section}-preview-${index}`}>
                      <div className="flex flex-wrap justify-between gap-2">
                        <h4 className="font-semibold text-[#2A2A2A]">
                          {entry.title || t("notAvailable")}
                        </h4>
                        <span className="text-sm text-[#6B6A6A]">
                          {[entry.startDate, entry.endDate].filter(Boolean).join(" - ")}
                        </span>
                      </div>
                      <p className="text-sm text-[#6B6A6A]">
                        {[entry.organization, entry.location].filter(Boolean).join(" · ")}
                      </p>
                      {entry.description && (
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#3A3A3A]">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilderPage;
