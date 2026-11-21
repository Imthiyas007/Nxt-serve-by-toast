import { createElement, useEffect, useState } from "react";
import { Save, X, Trash2 } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import uploadImage from "../../utils/uploadImage";
import Navbar from "../../components/layout/Navbar";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bookmark, Briefcase, FileText, UserRound } from "lucide-react";

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    resume: user?.resume || "",
  });

  const [formData, setFormData] = useState({ ...profileData });
  const [uploading, setUploading] = useState({ avatar: false, resume: false });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (file, type) => {
    setUploading((prev) => ({ ...prev, [type]: true }));

    try {
      const imgUploadRes = await uploadImage(file);
      if (!imgUploadRes.imageUrl) {
        throw new Error("Upload response did not include a file URL");
      }
      handleInputChange(type, imgUploadRes.imageUrl);
    } catch (error) {
      console.error("File upload failed:", error);
      toast.error(t("tryAgain"));
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file, type);
    }
    e.target.value = "";
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        formData
      );

      if (response.status === 200) {
        toast.success(t("profileUpdated"));
        setProfileData({ ...formData });
        updateUser({ ...formData });
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(t("tryAgain"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
  };

  const DeleteResume = async () => {
    setSaving(true);

    try {
      const response = await axiosInstance.post(
        API_PATHS.AUTH.DELETE_RESUME,
        {
          resumeUrl: user.resume || "",
        }
      );

      if (response.status === 200) {
        toast.success(t("resumeDeleted"));
        setProfileData((prev) => ({ ...prev, resume: "" }));
        setFormData((prev) => ({ ...prev, resume: "" }));
        updateUser({ resume: "" });
      }
    } catch (error) {
      console.error("Resume deletion failed:", error);
      toast.error(t("tryAgain"));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const userData = {
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
      resume: user?.resume || "",
    };

    setProfileData({ ...userData });
    setFormData({ ...userData });
  }, [user]);

  return (
    <div className="bg-[#FEF7F4]/95">
      <Navbar />

      <div className="min-h-screen bg-[#FEF7F4]/95 py-6 px-3 mt-16 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#FEFAF9]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#EB611F] to-[#F97316] px-4 py-5 sm:px-8 sm:py-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/75">{t("jobSeeker")}</p>
                  <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">{t("viewProfile")}</h1>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/15">
                  <UserRound className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { icon: FileText, label: t("resumeLabel"), value: user?.resume ? t("complete") : t("missing") },
                  { icon: Bookmark, label: t("savedJobs"), value: t("manage") },
                  { icon: Briefcase, label: t("jobSearch"), value: t("findJobs") },
                ].map(({ icon: Icon, label, value }) => (
                  <Link
                    key={label}
                    to={label === t("savedJobs") ? "/saved-jobs" : label === t("jobSearch") ? "/find-jobs" : "#resume-section"}
                    className="flex items-center gap-3 rounded-xl border border-[#FEFAF9] bg-[#FEF7F4]/60 p-4 transition hover:border-[#EB611F]/30 hover:bg-[#FEF7F4]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EB611F]/10 text-[#EB611F]">{createElement(Icon, { className: "h-5 w-5", "aria-hidden": true })}</span>
                    <span className="min-w-0"><span className="block text-xs text-[#6B6A6A]">{label}</span><span className="block truncate text-sm font-semibold text-[#2A2A2A]">{value}</span></span>
                  </Link>
                ))}
              </div>
              <div className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={formData?.avatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-4 border-[#FEFAF9]"
                    />
                    {uploading?.avatar && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block">
                      <span className="sr-only">{t("chooseAvatar")}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => handleImageChange(e, "avatar")}
                        disabled={uploading.avatar}
                        className="block w-full text-sm text-[#6B6A6A] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FEFAF9] file:text-[#EB611F] hover:file:bg-[#FEFAF9] hover:file:text-[#2A2A2A] transition-colors"
                      />
                    </label>
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                    {t("fullName")}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3 border border-[#FEFAF9] rounded-lg focus:ring-2 focus:ring-[#EB611F] focus:border-transparent transition-all text-[#2A2A2A]"
                    placeholder={t("enterFullName")}
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                    {t("emailAddress")}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 border border-[#FEFAF9] rounded-lg bg-[#FEFAF9] text-[#6B6A6A]"
                  />
                </div>

                {/* Resume Section */}
                {user?.resume ? (
                  <div id="resume-section">
                    <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                      {t("resumeLabel")}
                    </label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[#6B6A6A]">
                        {t("linkLabel")}{" "}
                        <a
                          href={user?.resume}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#EB611F] underline cursor-pointer hover:text-[#2A2A2A]"
                        >
                          {user?.resume}
                        </a>
                      </p>
                      <button
                        type="button"
                        className="cursor-pointer"
                        onClick={DeleteResume}
                        disabled={saving || uploading.resume}
                        aria-label={t("deleteResume")}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block">
                      <span className="sr-only">{t("chooseFile")}</span>
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => handleImageChange(e, "resume")}
                        disabled={uploading.resume}
                        className="block w-full text-sm text-[#6B6A6A] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FEFAF9] file:text-[#EB611F] hover:file:bg-[#FEFAF9] hover:file:text-[#2A2A2A] transition-colors"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#FEFAF9] pt-6 sm:flex-row sm:justify-end">
                                <Link
                  onClick={handleCancel}
                  to="/find-jobs"
                  className="w-full justify-center px-6 py-3 border border-[#FEFAF9] text-[#6B6A6A] rounded-lg hover:bg-[#FEFAF9] hover:text-[#2A2A2A] transition-colors flex items-center space-x-2 sm:w-auto"
                >
                  <X className="w-4 h-4" />
                  <span>{t("cancel")}</span>
                </Link>
                <button
                  onClick={handleSave}
                  disabled={saving || uploading.avatar || uploading.resume}
                  className="w-full justify-center px-6 py-3 bg-[#EB611F] text-white rounded-lg hover:bg-[#EB611F]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 sm:w-auto"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{saving ? t("saving") : t("saveChanges")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
