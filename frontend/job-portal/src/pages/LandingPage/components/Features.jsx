import React from 'react';
import { employerFeatures, jobSeekerFeatures } from "../../../utils/data";
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-[#F6F2F0] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#22252D] mb-6">
            {t("everythingYouNeedTo")}
            <span className="block bg-[#F53900] bg-clip-text text-transparent">
              {t("succeed")}
            </span>
          </h2>
          <p className="text-xl text-[#676664] max-w-3xl mx-auto">
            {t("featuresSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          {/* Job Seekers Section */}
          <div>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-[#22252D] mb-4">
                {t("forJobSeeker")}
              </h3>
              <div className="w-24 h-1 bg-[#F53900] mx-auto rounded-full" />
            </div>

            <div className="space-y-8">
              {jobSeekerFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 rounded-2xl p-6"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-[#E5E5E5] rounded-xl flex items-center justify-center">
                    <feature.icon aria-hidden="true" className="w-6 h-6 text-[#F53900]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-[#22252D] mb-2">
                      {t(feature.title)}
                    </h4>
                    <p className="text-[#676664] leading-relaxed">
                      {t(feature.description)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employers Section */}
          <div>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-[#22252D] mb-4">
                {t("forEmployers")}
              </h3>
              <div className="w-24 h-1 bg-[#F53900] mx-auto rounded-full" />
            </div>

            <div className="space-y-8">
              {employerFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 rounded-2xl p-6"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-[#E5E5E5] rounded-xl flex items-center justify-center">
                    <feature.icon aria-hidden="true" className="w-6 h-6 text-[#F53900]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-[#22252D] mb-2">
                      {t(feature.title)}
                    </h4>
                    <p className="text-[#676664] leading-relaxed">
                      {t(feature.description)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
