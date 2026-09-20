"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { format, parseISO } from "date-fns";
import type { EXPERIENCE_QUERYResult } from "../../../../sanity.types";
import SkillChip from "../shared/SkillChip";
import SkillCarousel from "../shared/SkillCarousel";

gsap.registerPlugin(ScrollTrigger);

interface ExperienceSectionProps {
  experienceData: EXPERIENCE_QUERYResult;
}

export default function ExperienceSection({
  experienceData,
}: ExperienceSectionProps) {
  const experienceRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const experienceSection = experienceRef.current;

    if (!experienceSection) return;

    // Create GSAP context for proper cleanup
    const ctx = gsap.context(() => {
      // Experience Section - Pinned with multiple items
      const experienceItems = gsap.utils.toArray(".experience-item");
      const experienceCount = experienceItems.length;

      const experienceTl = gsap.timeline({
        scrollTrigger: {
          trigger: experienceSection,
          start: "top top",
          end: `+=${experienceCount * 100}%`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          snap: {
            snapTo: "labels",
            duration: { min: 0.5, max: 1 },
          },
        },
      });

      // Initial state - hide all items
      gsap.set(experienceItems, { opacity: 0, y: 100 });

      experienceItems.forEach((item: any, index) => {
        const isLast = index === experienceItems.length - 1;

        // Animate in
        experienceTl.to(
          item,
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          index * 1
        );

        experienceTl.addLabel(`experienceAnimationGroup${index}`);

        // Animate out (except for last item)
        if (!isLast) {
          experienceTl.to(
            item,
            {
              opacity: 0,
              y: -100,
              duration: 0.3,
              ease: "power2.in",
            },
            index * 1 + 0.7
          );
        }
      });
    }, experienceRef);

    return () => {
      ctx.revert(); // Only kills ScrollTriggers created within this context
    };
  }, [experienceData]);

  // Sanity dates are "YYYY-MM-DD"; parseISO reads them as local dates so the
  // month never shifts across timezones. A missing end date means current.
  const formatDate = (date: string | null) =>
    date ? format(parseISO(date), "MMMM yyyy") : "Present";

  return (
    <>
      <section
        id="experience"
        ref={experienceRef}
        className="resume-section experience-section min-h-screen flex items-center justify-center relative"
      >
        <div className="subsections w-full">
          {experienceData.map((job) => (
            <div
              key={job._id}
              className="experience-item absolute inset-0 flex items-center justify-center px-8"
            >
              <div className="max-w-5xl mx-auto w-full">
                <p className="text-xl sm:text-3xl md:text-5xl font-kode-mono font-bold text-foreground mb-3 leading-tight">
                  {job.employer}
                </p>
                <p className="text-md sm:text-xl md:text-2xl font-kode-mono text-primary font-medium mb-2">
                  {job.role}
                </p>
                <p className="text-sm sm:text-lg md:text-xl font-kode-mono font-normal text-foreground mb-6">
                  {formatDate(job.startDate)} - {formatDate(job.endDate)}
                </p>
                <div className="flex flex-wrap gap-3">
                  <SkillCarousel
                    skillsData={job.skills ?? []}
                    autoPlay={true}
                    className="h-10"
                  />
                </div>
                <ul className="space-y-4 mb-8">
                  {(job.notes ?? []).map((note, noteIndex) => (
                    <li
                      key={noteIndex}
                      className="text-sm sm:text-lg md:text-xl font-work-sans text-foreground leading-relaxed flex items-start"
                    >
                      <span className="mr-4 text-lg shrink-0">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>

                <div>
                  {/* <h6 className="font-kode-mono font-[400] mb-4">
                    Technologies & Skills
                  </h6> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
