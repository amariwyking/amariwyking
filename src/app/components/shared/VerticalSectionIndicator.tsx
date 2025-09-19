"use client";

import { useState, useEffect } from "react";

interface Section {
  id: string;
  name: string;
  displayName: string;
}

interface VerticalSectionIndicatorProps {
  sections: Section[];
  className?: string;
}

export default function VerticalSectionIndicator({
  sections,
  className = ""
}: VerticalSectionIndicatorProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "");

  // Handle scroll detection for active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;

          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sections]);

  // Handle smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <nav
      className={`fixed right-6 top-1/2 -translate-y-1/2 z-40 ${className}`}
      aria-label="Section navigation"
    >
      <div className="flex flex-col gap-2">
        {sections.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`
                group relative px-3 py-2 rounded-sm transition-all duration-300 ease-out
                font-kode-mono font-medium text-xs sm:text-sm
                transform hover:scale-105 focus:scale-105
                bg-background/80 backdrop-blur-sm shadow-sm
                ${
                  isActive
                    ? "border border-primary text-primary"
                    : "border border-border/50 text-foreground/60 hover:text-foreground/90 hover:border-primary/50"
                }
              `}
              aria-label={`Go to ${section.displayName} section`}
            >
              <span className="whitespace-nowrap">{section.displayName}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}