import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Upload,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import {
  validateAvatar,
  validateEmail,
  validatePassword,
} from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/layout/LanguageSwitcher";

const SignUp = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const MotionDiv = motion.div;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: location.state?.from?.pathname === "/post-job" ? "employer" : "",
    avatar: null,
  });

  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    avatarPreview: null,
    success: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formState.errors[name]) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: "" },
      }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    if (formState.errors.role) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, role: "" },
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateAvatar(file, t);
    if (error) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, avatar: error },
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, avatar: file }));
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormState((prev) => ({
        ...prev,
        avatarPreview: event.target.result,
        errors: { ...prev.errors, avatar: "" },
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errors = {
      fullName: !formData.fullName ? t("enterAccountName") : "",
      email: validateEmail(formData.email, t),
      password: validatePassword(formData.password, t),
      role: !formData.role ? t("selectRole") : "",
      avatar: "",
    };
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });
    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormState((prev) => ({ ...prev, loading: true }));

    try {
      let avatarUrl = "";
      if (formData.avatar) {
        const imgUploadRes = await uploadImage(formData.avatar);
        avatarUrl = imgUploadRes.imageUrl || "";
      }
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        avatar: avatarUrl || "",
      });
      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        errors: {},
      }));
      const { token } = response.data;
      if (token) {
        login(response.data, token);
        const requestedPath = location.state?.from?.pathname;
        const destination =
          formData.role === "employer" &&
          requestedPath?.startsWith("/") &&
          !requestedPath.startsWith("//")
            ? requestedPath
            : formData.role === "employer"
              ? "/employer-dashboard"
              : "/find-jobs";
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 2000);
      }
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: {
          submit:
            error.response?.data?.message ||
            t("registrationFailed"),
        },
      }));
    }
  };

  if (formState.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <MotionDiv
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center"
        >
          <CheckCircle className="w-16 h-16 text-[#ff4d00] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("accountCreated")}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("registrationSuccess")}
          </p>
          <div className="animate-spin w-6 h-6 border-2 border-[#ff4d00] border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-gray-500 mt-2">
            {t("redirectingDashboard")}
          </p>
        </MotionDiv>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] px-4 py-8">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full"
      >
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("createAccount")}
          </h2>
          <p className="text-sm text-gray-600">
            {t("createAccountSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("fullName")} *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  formState.errors.fullName
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent transition-colors`}
                placeholder={t("enterFullName")}
              />
            </div>
            {formState.errors.fullName && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {formState.errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("emailAddress")} *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  formState.errors.email ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent transition-colors`}
                placeholder={t("enterYourEmail")}
              />
            </div>
            {formState.errors.email && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {formState.errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("password")} *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={formState.showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                  formState.errors.password
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent transition-colors`}
                placeholder={t("createStrongPassword")}
              />
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({
                    ...prev,
                    showPassword: !prev.showPassword,
                  }))
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {formState.showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formState.errors.password && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {formState.errors.password}
              </p>
            )}
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("profilePicture")}
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {formState.avatarPreview ? (
                  <img
                    src={formState.avatarPreview}
                    alt={t("profilePicture")}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="avatar"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <label
                  htmlFor="avatar"
                  className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t("uploadPhoto")}</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">{t("uploadPhotoHint")}</p>
              </div>
            </div>
            {formState.errors.avatar && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {formState.errors.avatar}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t("iAm")} *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRoleChange("jobseeker")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.role === "jobseeker"
                    ? "border-[#ff4d00] bg-orange-50 text-[#ff4d00]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <UserCheck className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">{t("jobSeeker")}</div>
                <div className="text-xs text-gray-500">
                  {t("jobSeekerHint")}
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("employer")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.role === "employer"
                    ? "border-[#ff4d00] bg-orange-50 text-[#ff4d00]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Building2 className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">{t("employer")}</div>
                <div className="text-xs text-gray-500">{t("employerHint")}</div>
              </button>
            </div>
            {formState.errors.role && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {formState.errors.role}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {formState.errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {formState.errors.submit}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formState.loading}
            className="w-full bg-[#ff4d00] text-white py-3 rounded-lg font-semibold hover:bg-[#e64400] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {formState.loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>{t("creatingAccount")}</span>
              </>
            ) : (
              <span>{t("createAccountButton")}</span>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              {t("alreadyHaveAccount")}{" "}
              <Link
                to="/login"
                state={location.state}
                className="text-[#ff4d00] hover:text-[#e64400] font-medium"
              >
                {t("signInHere")}
              </Link>
            </p>
          </div>
        </form>
      </MotionDiv>
    </div>
  );
};

export default SignUp;
