import { ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORIES, JOB_TYPES } from "../../../utils/data";
import SalaryRangeSlider from "../../../components/Input/SalaryRangeSlider";
import { useTranslation } from "react-i18next";

const FilterSection = ({ title, children, isExpanded, onToggle }) => (
  <div className="border-b border-[#FEFAF9] pb-4 mb-4 last:border-b-0">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      className="flex items-center justify-between w-full text-left font-semibold text-[#2A2A2A] mb-3 hover:text-[#EB611F] transition-colors"
    >
      {title}
      {isExpanded ? (
        <ChevronUp className="w-4 h-4 text-[#EB611F]" />
      ) : (
        <ChevronDown className="w-4 h-4 text-[#EB611F]" />
      )}
    </button>
    {isExpanded && children}
  </div>
);

const FilterContent = ({
  toggleSection,
  clearAllFilters,
  expandedSections,
  filters,
  handleFilterChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-[#EB611F] hover:text-[#d4551b] font-semibold text-sm"
        >
          {t("clearAll")}
        </button>
      </div>

      <FilterSection
        title={t("jobType")}
        isExpanded={expandedSections?.jobType}
        onToggle={() => toggleSection("jobType")}
      >
        <div className="space-y-3">
          {JOB_TYPES.map((type) => (
            <label
              key={type.value}
              className="flex items-center cursor-pointer"
            >
              <input
                type="radio"
                name="jobType"
                className="rounded border-[#FEFAF9] text-[#EB611F] shadow-sm focus:border-[#EB611F] focus:ring focus:ring-[#EB611F]/30 focus:ring-opacity-50"
                checked={filters?.type === type.value}
                onChange={(e) =>
                  handleFilterChange(
                    "type",
                    e.target.checked ? type.value : ""
                  )
                }
              />
              <span className="ml-3 text-[#2A2A2A] font-medium">
                {t(
                  type.value === "Full-Time"
                    ? "fullTime"
                    : type.value === "Part-Time"
                      ? "partTime"
                      : type.value.toLowerCase()
                )}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title={t("salaryRange")}
        isExpanded={expandedSections.salary}
        onToggle={() => toggleSection("salary")}
      >
        <SalaryRangeSlider
          filters={filters}
          handleFilterChange={handleFilterChange}
        />
      </FilterSection>

      <FilterSection
        title={t("category")}
        isExpanded={expandedSections?.categories}
        onToggle={() => toggleSection("categories")}
      >
        <div className="space-y-3">
          {CATEGORIES.map((type) => (
            <label
              key={type.value}
              className="flex items-center cursor-pointer"
            >
              <input
                type="radio"
                name="category"
                className="rounded border-[#FEFAF9] text-[#EB611F] shadow-sm focus:border-[#EB611F] focus:ring focus:ring-[#EB611F]/30 focus:ring-opacity-50"
                checked={filters?.category === type.value}
                onChange={(e) =>
                  handleFilterChange(
                    "category",
                    e.target.checked ? type.value : ""
                  )
                }
              />
              <span className="ml-3 text-[#2A2A2A] font-medium">
                {t(type.value.toLowerCase())}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </>
  );
};

export default FilterContent;
