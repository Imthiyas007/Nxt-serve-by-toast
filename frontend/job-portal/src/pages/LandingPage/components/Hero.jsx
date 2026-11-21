import {
  Search,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const MotionLink = Motion.create(Link);

const Hero = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const reveal = (offset, delay = 0) => ({
    initial: prefersReducedMotion ? false : { opacity: 0, y: offset },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: prefersReducedMotion ? 0 : 0.8,
      delay: prefersReducedMotion ? 0 : delay,
    },
  });

  const handlePostJob = (event) => {
    if (isAuthenticated && user?.role !== "employer") {
      event.preventDefault();
      toast.error(t("employerAccountRequired"));
    }
  };

  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-[#F6F2F0] pb-12 pt-20 sm:pb-16 sm:pt-24">
      <div className="container mx-auto px-4 lg:max-w-5xl">
        <div className="max-w-4xl mx-auto text-center">
          <Motion.h1
            {...reveal(30)}
            className="mb-6 pt-4 text-4xl font-bold leading-tight text-[#22252D] sm:pt-10 md:text-5xl lg:text-6xl"
          >
            {t("heroTitle")}
            <span className="block bg-[#F53900] bg-clip-text text-transparent mt-2">
              {t("heroTagline")}
            </span>
          </Motion.h1>

          <Motion.p
            {...reveal(30, 0.2)}
            className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-[#676664] md:mb-12 md:text-xl"
          >
            {t("heroSubtitle")}
          </Motion.p>

          <Motion.div
            {...reveal(30, 0.4)}
            className="mb-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center"
          >
            <MotionLink
              to="/find-jobs"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="group flex w-full items-center justify-center gap-2 whitespace-normal rounded-xl bg-gradient-to-r from-[#F53900] to-[#FF6B00] px-6 py-3 text-center text-base font-semibold text-white shadow-md transition-shadow duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900] focus-visible:ring-offset-2 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
            >
              <Search aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span>{t("findJobs")}</span>
              <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </MotionLink>

            <MotionLink
              to="/post-job"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="w-full rounded-xl border border-[#E5E5E5] bg-white px-6 py-3 text-center text-base font-semibold text-[#676664] shadow-sm transition-shadow duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900] focus-visible:ring-offset-2 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              onClick={handlePostJob}
            >
              {t("postJob")}
            </MotionLink>

            <MotionLink
              to="/interview-page"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="group flex w-full items-center justify-center gap-2 whitespace-normal rounded-xl border border-[#F53900]/40 bg-transparent px-6 py-3 text-center text-base font-semibold text-[#C63200] transition-colors duration-300 hover:bg-[#F53900]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F53900] focus-visible:ring-offset-2 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
            >
              <ClipboardCheck aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span>{t("interviewPrep")}</span>
              <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </MotionLink>
          </Motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
