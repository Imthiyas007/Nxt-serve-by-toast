import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const SalaryRangeSlider = ({ filters, handleFilterChange }) => {
  const { t } = useTranslation();
  const [minSalary, setMinSalary] = useState(filters?.minSalary || 0);
  const [maxSalary, setMaxSalary] = useState(filters?.maxSalary || 0);

  useEffect(() => {
    setMinSalary(filters?.minSalary || 0);
  }, [filters?.minSalary]);

  useEffect(() => {
    setMaxSalary(filters?.maxSalary || 0);
  }, [filters?.maxSalary]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
            {t("minSalary")}
          </label>
          <input
            type="number"
            placeholder="0"
            min="0"
            step="1000"
            className="w-full px-3 py-2 border border-[#FEFAF9] rounded-md shadow-sm focus:border-[#EB611F] focus:ring focus:ring-[#EB611F] focus:ring-opacity-50 text-[#2A2A2A] bg-[#FEFAF9]"
            value={minSalary || ""}
            onChange={({ target }) => setMinSalary(target.value)}
            onBlur={() =>
              handleFilterChange(
                "minSalary",
                minSalary ? parseInt(minSalary) : ""
              )
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
            {t("maxSalary")}
          </label>
          <input
            type="number"
            placeholder={t("noLimit")}
            min="0"
            step="1000"
            className="w-full px-3 py-2 border border-[#FEFAF9] rounded-md shadow-sm focus:border-[#EB611F] focus:ring focus:ring-[#EB611F] focus:ring-opacity-50 text-[#2A2A2A] bg-[#FEFAF9]"
            value={maxSalary || ""}
            onChange={({ target }) => setMaxSalary(target.value)}
            onBlur={() =>
              handleFilterChange(
                "maxSalary",
                maxSalary ? parseInt(maxSalary) : ""
              )
            }
          />
        </div>
      </div>

      {(minSalary || maxSalary) && (
        <div className="text-sm text-[#6B6A6A] bg-[#FEFAF9] px-3 py-2 rounded">
          {t("range")}: {minSalary ? `$${minSalary.toLocaleString()}` : "$0"} –{" "}
          {maxSalary ? `$${maxSalary.toLocaleString()}` : t("noLimit")}
        </div>
      )}
    </div>
  );
};

export default SalaryRangeSlider;
