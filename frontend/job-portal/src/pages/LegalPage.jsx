import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/layout/Navbar";

const legalDrafts = {
  privacy: {
    title: "Privacy policy",
    updated: "Draft for review",
    sections: [
      {
        heading: "Information collected",
        paragraphs: [
          "NxtServe stores account details such as your name, email address, role, and the profile information you choose to provide. Jobseekers may provide skills and a resume; employers may provide company details and job listings.",
          "The service stores applications, saved jobs, messages, badge requests, and newsletter consent needed to provide the corresponding features.",
        ],
      },
      {
        heading: "How information is used",
        paragraphs: [
          "Information is used to operate accounts, display job listings, process applications, support messaging and badge verification, and provide job-matching and interview-practice features.",
          "When you use AI features, the text needed to fulfill your request may be sent to Google Gemini. Newsletter addresses are sent to Resend only after you give consent.",
        ],
      },
      {
        heading: "Service providers",
        paragraphs: [
          "Account and application data is stored in the configured MongoDB database. Uploaded images and resumes are stored with Cloudinary. AI requests use Google Gemini, and newsletter subscriptions use Resend.",
          "The operator must confirm the providers' applicable terms, data locations, retention settings, and contractual safeguards before publishing this policy.",
        ],
      },
      {
        heading: "Retention and your choices",
        paragraphs: [
          "The service retains information while it is needed to operate your account and its features. A complete account deletion and data-retention process is not yet available; these details must be finalized by the operator before this draft is published.",
          "You can update profile information in the application and can remove a saved resume from your profile. Contact and privacy-request procedures must be supplied by the operator.",
        ],
      },
      {
        heading: "Children and policy changes",
        paragraphs: [
          "The operator must add an age-eligibility rule and a contact address before publication. This draft may change as the service and its providers change.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of service",
    updated: "Draft for review",
    sections: [
      {
        heading: "Using NxtServe",
        paragraphs: [
          "NxtServe connects jobseekers and employers in the hospitality industry. You are responsible for keeping your account credentials private and for providing accurate profile, application, and job-posting information.",
          "Employers are responsible for the accuracy and legality of their job listings. Jobseekers are responsible for the accuracy of their applications, resumes, and claimed skills.",
        ],
      },
      {
        heading: "Communication and verification",
        paragraphs: [
          "Messages should be relevant to hiring and must not be used for harassment, fraud, spam, or unlawful conduct. Skill-badge verification represents an employer's assessment and is not a guarantee of a user's qualifications.",
        ],
      },
      {
        heading: "AI features",
        paragraphs: [
          "Job matching, interview practice, and generated suggestions are provided as informational tools. They may be incomplete or inaccurate and are not guarantees of employment, candidate suitability, or professional outcomes. Review AI-generated content before relying on it.",
        ],
      },
      {
        heading: "Availability and enforcement",
        paragraphs: [
          "The operator may suspend access for abuse or violations of these terms and may change or discontinue features. The operator must add the governing law, dispute process, liability terms, legal entity, and contact details before publishing this draft.",
        ],
      },
    ],
  },
};

const LegalPage = ({ document }) => {
  const { t } = useTranslation();
  const content = legalDrafts[document];

  return (
    <div className="min-h-screen bg-[#FEF7F4]/95">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-24">
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <strong>Draft for legal review.</strong>{" "}
          This is not legal advice and must be reviewed and completed by the
          service operator before publication.
        </div>
        <article className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#EB611F]">
            {content.updated}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#2A2A2A]">
            {content.title}
          </h1>
          <div className="mt-8 space-y-8">
            {content.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-semibold text-[#2A2A2A]">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-[#6B6A6A]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <Link
            to="/"
            className="mt-10 inline-flex rounded-lg bg-[#EB611F] px-4 py-2 font-semibold text-white hover:bg-[#d4551b]"
          >
            {t("home")}
          </Link>
        </article>
      </main>
    </div>
  );
};

export default LegalPage;
