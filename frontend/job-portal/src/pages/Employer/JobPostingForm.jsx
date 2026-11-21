import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import {
  AlertCircle,
  MapPin,
  DollarSign,
  Briefcase,
  Users,
  Eye,
  Send,
} from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { CATEGORIES, JOB_TYPES } from "../../utils/data";
import toast from "react-hot-toast";
import InputField from "../../components/Input/InputField";
import SelectField from "../../components/Input/SelectField";
import TextareaField from "../../components/Input/TextareaField";
import JobPostingPreview from "../../components/Cards/JobPostingPreview";
import { useTranslation } from "react-i18next";

const JobPostingForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const jobId = location.state?.jobId || null;

  const [formData, setFormData] = useState({
    jobTitle: "",
    location: "",
    category: "",
    jobType: "",
    isRemote: false,
    currency: "usd",
    description: "",
    requirements: "",
    salaryMin: "",
    salaryMax: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const validationErrors = {};
    if (!formData.jobTitle?.trim()) validationErrors.jobTitle = t("jobTitleRequired");
    if (!formData.location?.trim()) validationErrors.location = t("locationRequired");
    if (!formData.category?.trim()) validationErrors.category = t("categoryRequired");
    if (!formData.jobType?.trim()) validationErrors.jobType = t("jobTypeRequired");
    if (!formData.description?.trim()) validationErrors.description = t("descriptionRequired");
    if (!formData.requirements?.trim()) validationErrors.requirements = t("requirementsRequired");
    if (formData.salaryMin === "") validationErrors.salaryMin = t("salaryMinRequired");
    if (formData.salaryMax === "") validationErrors.salaryMax = t("salaryMaxRequired");
    if (
      formData.salaryMin !== "" &&
      formData.salaryMax !== "" &&
      Number(formData.salaryMin) >= Number(formData.salaryMax)
    ) {
      validationErrors.salary = t("salaryInvalid");
    }
    return validationErrors;
  };

  const isFormValid = () => Object.keys(validateForm()).length === 0;

  const handlePreview = () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setIsPreview(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    const jobPayload = {
      title: formData.jobTitle,
      description: formData.description,
      requirements: formData.requirements,
      location: formData.location,
      category: formData.category,
      type: formData.jobType,
      isRemote: formData.isRemote,
      currency: formData.currency,
      salaryMin: formData.salaryMin,
      salaryMax: formData.salaryMax,
    };

    try {
      const response = jobId
        ? await axiosInstance.put(API_PATHS.JOBS.UPDATE_JOB(jobId), jobPayload)
        : await axiosInstance.post(API_PATHS.JOBS.POST_JOB, jobPayload);

      if (response.status === 200 || response.status === 201) {
        toast.success(
          jobId ? t("jobUpdatedSuccess") : t("jobPostedSuccess")
        );
        setFormData({
          jobTitle: "",
          location: "",
          category: "",
          jobType: "",
          isRemote: false,
          currency: "usd",
          description: "",
          requirements: "",
          salaryMin: "",
          salaryMax: "",
        });
        navigate("/employer-dashboard");
        return;
      }

      console.error("Unexpected response:", response);
      toast.error(t("tryAgain"));
    } catch (error) {
      if (error.response?.data?.message) {
        console.error("API Error:", error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Unexpected error:", error);
        toast.error(t("jobPostFailed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (jobId) {
        try {
          const response = await axiosInstance.get(
            API_PATHS.JOBS.GET_JOB_BY_ID(jobId)
          );
          const jobData = response.data;
          if (jobData) {
            setFormData({
              jobTitle: jobData.title,
              location: jobData.location,
              category: jobData.category,
              jobType: jobData.type,
              isRemote: jobData.isRemote || false,
              currency: jobData.currency || "usd",
              description: jobData.description,
              requirements: jobData.requirements,
              salaryMin: jobData.salaryMin,
              salaryMax: jobData.salaryMax,
            });
          }
        } catch (error) {
          console.error("Error fetching job details:", error);
          toast.error(error.response?.data?.message || t("tryAgain"));
          navigate("/manage-jobs");
        }
      }
    };

    fetchJobDetails();
  }, [jobId, navigate, t]);

  if (isPreview) {
    return (
      <DashboardLayout activeMenu="post-job">
        <JobPostingPreview formData={formData} setIsPreview={setIsPreview} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="post-job">
      <div className="min-h-screen bg-[#FEF7F4]/95 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-[#FEFAF9] shadow-xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-[#2A2A2A]">
                  {t("postNewJob")}
                </h2>
                <p className="text-sm text-[#6B6A6A] mt-1">
                  {t("createJobPostingHelp")}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={!isFormValid()}
                  className="group flex items-center space-x-2 px-6 py-3 text-sm font-medium text-[#6B6A6A] hover:text-[#2A2A2A] bg-white/50 hover:bg-[#FEFAF9] border border-[#FEFAF9] hover:border-transparent rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Eye className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span>{t("preview")}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label={t("jobTitleLabel")}
                id="jobTitle"
                placeholder={t("jobTitlePlaceholder")}
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                error={errors.jobTitle}
                required
                icon={Briefcase}
              />

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-4 sm:space-y-0">
                  <div className="flex-1">
                    <InputField
                      label={t("location")}
                      id="location"
                      placeholder={t("jobLocationPlaceholder")}
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      error={errors.location}
                      icon={MapPin}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isRemote"
                    checked={formData.isRemote}
                    onChange={(e) =>
                      handleInputChange("isRemote", e.target.checked)
                    }
                    className="rounded border-[#FEFAF9] text-[#EB611F] shadow-sm focus:border-[#EB611F] focus:ring focus:ring-[#EB611F]/30 focus:ring-opacity-50"
                  />
                  <label htmlFor="isRemote" className="text-sm font-medium text-[#2A2A2A]">
                    {t("remotePosition")}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label={t("category")}
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  options={CATEGORIES.map((option) => ({
                    ...option,
                    label: t(option.value.toLowerCase()),
                  }))}
                  placeholder={t("selectCategory")}
                  error={errors.category}
                  required
                  icon={Users}
                />

                <SelectField
                  label={t("jobType")}
                  id="jobType"
                  value={formData.jobType}
                  onChange={(e) => handleInputChange("jobType", e.target.value)}
                  options={JOB_TYPES.map((option) => ({
                    ...option,
                    label: t(
                      option.value === "Full-Time"
                        ? "fullTime"
                        : option.value === "Part-Time"
                          ? "partTime"
                          : option.value.toLowerCase()
                    ),
                  }))}
                  placeholder={t("selectJobType")}
                  error={errors.jobType}
                  required
                  icon={Briefcase}
                />
              </div>

              <TextareaField
                label={t("jobDescriptionLabel")}
                id="description"
                placeholder={t("descriptionPlaceholder")}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                                error={errors.description}
                helperText={t("responsibilitiesHelp")}
                required
              />

              <TextareaField
                label={t("requirementsLabel")}
                id="requirements"
                placeholder={t("requirementsPlaceholder")}
                value={formData.requirements}
                onChange={(e) =>
                  handleInputChange("requirements", e.target.value)
                }
                error={errors.requirements}
                helperText={t("qualificationsHelp")}
                required
              />

              {/* Salary Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#2A2A2A]">
                  {t("salaryRange")} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <DollarSign className="h-5 w-5 text-[#6B6A6A]" />
                    </div>
                    <input
                      type="number"
                      placeholder={t("minimum")}
                      value={formData.salaryMin}
                      aria-invalid={Boolean(errors.salaryMin)}
                      onChange={(e) =>
                        handleInputChange("salaryMin", e.target.value)
                      }
                      className="w-full pl-10 pr-3 py-2.5 border border-[#FEFAF9] rounded-lg text-base text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#EB611F] focus:ring-opacity-20 focus:border-[#EB611F] transition-colors duration-200 bg-white"
                    />
                    {errors.salaryMin && (
                      <p className="mt-1 text-sm text-red-600">{errors.salaryMin}</p>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <DollarSign className="h-5 w-5 text-[#6B6A6A]" />
                    </div>
                    <input
                      type="number"
                      placeholder={t("maximum")}
                      value={formData.salaryMax}
                      aria-invalid={Boolean(errors.salaryMax)}
                      onChange={(e) =>
                        handleInputChange("salaryMax", e.target.value)
                      }
                      className="w-full pl-10 pr-3 py-2.5 border border-[#FEFAF9] rounded-lg text-base text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#EB611F] focus:ring-opacity-20 focus:border-[#EB611F] transition-colors duration-200 bg-white"
                    />
                    {errors.salaryMax && (
                      <p className="mt-1 text-sm text-red-600">{errors.salaryMax}</p>
                    )}
                  </div>
                </div>
                {errors.salary && (
                  <div className="flex items-center space-x-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.salary}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#EB611F] hover:bg-[#c2410c] focus:outline-none focus:ring-offset-2 focus:ring-[#EB611F] disabled:bg-[#FEFAF9] disabled:text-[#6B6A6A] disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t("publishingJob")}
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      {t("publishJob")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobPostingForm;
