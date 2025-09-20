"use client";

import { useState } from "react";
import { gsap } from "gsap";
import { ProjectCardProps } from "@/app/types/project-showcase";
import SkillCarousel from "../shared/SkillCarousel";
import ProjectDetails from "./ProjectDetails";

/**
 * Creates a GSAP timeline for the project card animation.
 * The animation sequence includes the title fade-in, the divider's
 * width growth, its movement to the bottom of the card, and finally,
 * the details fade-in.
 * * @param rootElement The root HTML element of the project card.
 * @returns A GSAP timeline instance.
 */
export function getProjectCardTimeline(
  rootElement: HTMLElement
): gsap.core.Timeline {
  const tl = gsap.timeline();

  // Find all elements to be animated within the provided rootElement
  const title = rootElement.querySelector(".project-title");
  const widthLine = rootElement.querySelector(".scroll-width-line");
  const details = rootElement.querySelector(".project-details");

  const wiperWidthDuration = 0.5;

  if (title && widthLine && details) {
    tl.from(title, { opacity: 0, y: 50, duration: 0.5 })
      .fromTo(
        widthLine,
        {
          width: "0%",
        },
        {
          width: "100%",
          ease: "power2.in",
          duration: wiperWidthDuration,
        }
      )
      .to(widthLine, {
        // Use a function-based value to calculate the exact y position
        y: () => {
          const cardBounds = rootElement.getBoundingClientRect();
          const lineBounds = widthLine.getBoundingClientRect();
          // The difference is the y value needed to move the line from its top to the card's bottom
          return (
            cardBounds.bottom - lineBounds.top - lineBounds.height / 2 + 16
          );
        },
        ease: "power2.inOut",
        duration: 1,
      })
      .from(
        details,
        {
          clipPath: "inset(0 0 100% 0)",
          ease: "power2.out",
          duration: 0.5,
        },
        "-=0.5"
      )
      .to(widthLine, {
        width: "0%",
        ease: "power2.in",
        duration: wiperWidthDuration,
      });
  } else if (widthLine && rootElement) {
    // Fallback if other elements are not found, still animate the line
    tl.fromTo(
      widthLine,
      {
        width: "0%",
      },
      {
        width: "100%",
        ease: "power2.out",
        duration: wiperWidthDuration,
      }
    )
      .to(widthLine, {
        y: () => {
          const cardBounds = rootElement.getBoundingClientRect();
          const lineBounds = widthLine.getBoundingClientRect();
          return cardBounds.bottom - lineBounds.top - lineBounds.height / 2;
        },
        ease: "power2.inOut",
        duration: 1,
      })
      .to(widthLine, {
        width: "0%",
        ease: "power2.in",
        duration: wiperWidthDuration,
      });
  }

  return tl;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <div className="project-card flex w-full max-w-6xl mx-auto justify-center">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:max-w-2/3 space-y-4">
        <h1 className="project-title font-kode-mono font-bold text-2xl sm:text-6xl lg:text-4xl text-left leading-tight tracking-tight text-primary">
          {project.title}
        </h1>

        {/* Animated Width Divider */}
        <div
          className="scroll-width-line h-1 justify-self-center rounded-2xl shadow-primary shadow-lg bg-primary"
          style={{ width: "0%" }}
        />

        {/* Project Information */}
        <div className="project-details space-y-4">
          {/* Skills */}
          <div className="">
            <SkillCarousel
              skillsData={project.skills}
              autoPlay={true}
              className="h-10"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-primary hover:text-primary/80 font-kode-mono text-sm transition-colors duration-200"
                aria-label={showFullDescription ? "Show less" : "Show more"}
              >
                {showFullDescription ? "Show Less" : "Learn More"}
              </button>
            </div>

            <ProjectDetails
              description={project.description}
              isExpanded={showFullDescription}
              wordLimit={30}
            />
          </div>

          {/* Project Metadata */}
          <div className="pt-4 border-t border-border space-y-2">
            {project.project_end_date && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground font-kode-mono">
                <span>Completed:</span>
                <time dateTime={project.project_end_date}>
                  {new Date(project.project_end_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                    }
                  )}
                </time>
              </div>
            )}

            {project.featured && (
              <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-kode-mono">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured Project
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
