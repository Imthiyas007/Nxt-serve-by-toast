const formatSalaryRange = (job, language, fallback) => {
  const minimum =
    job?.salaryMin == null || job.salaryMin === ""
      ? null
      : Number(job.salaryMin);
  const maximum =
    job?.salaryMax == null || job.salaryMax === ""
      ? null
      : Number(job.salaryMax);
  if (
    (minimum == null || !Number.isFinite(minimum)) &&
    (maximum == null || !Number.isFinite(maximum))
  ) {
    return fallback;
  }

  const rawCurrency = String(job?.currency || "USD").toUpperCase();
  const currency = /^[A-Z]{3}$/.test(rawCurrency) ? rawCurrency : "USD";
  let formatter;
  try {
    formatter = new Intl.NumberFormat(language, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
  } catch {
    return fallback;
  }

  const formattedMinimum =
    minimum != null && Number.isFinite(minimum)
      ? formatter.format(minimum)
      : null;
  const formattedMaximum =
    maximum != null && Number.isFinite(maximum)
      ? formatter.format(maximum)
      : null;

  if (formattedMinimum && formattedMaximum) {
    return `${formattedMinimum} - ${formattedMaximum}`;
  }
  return formattedMinimum || formattedMaximum || fallback;
};

export default formatSalaryRange;
