import React from "react";
import { useTranslation } from "react-i18next";

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const statusConfig = {
    Applied: "bg-blue-100 text-blue-800",
    Interview: "bg-yellow-100 text-yellow-800",
    Hired: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800 line-through",
  };
  const statusLabels = {
    Applied: "applicationApplied",
    Interview: "applicationInterview",
    "In Review": "applicationInReview",
    Hired: "hired",
    Rejected: "applicationRejected",
    Accepted: "applicationAccepted",
  };

  return (
    <span
      className={`px-3 py-1 rounded text-sm font-medium ${
        statusConfig[status] || "bg-blue-100 text-blue-800"
      }`}
    >
      {statusLabels[status] ? t(statusLabels[status]) : status}
    </span>
  );
};

export default StatusBadge;
