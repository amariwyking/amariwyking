"use client";

import { useState, useEffect } from "react";

interface Section {
  id: string;
  name: string;
  displayName: string;
}

interface MobileSectionIndicatorProps {
  sections: Section[];
  className?: string;
}

export default function MobileSectionIndicator({
  sections,
  className = ""
}: MobileSectionIndicatorProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "");
  const [isVisible, setIsVisible] = useState(true);

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
      className={`
        fixed top-20 left-0 right-0 z-40
        transition-all duration-500 ease-out
        ${isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
        }
        ${className}
      `}
      aria-label="Section navigation"
    >
      <div className="flex items-center justify-center gap-1 px-6 py-2 bg-background/60 backdrop-blur-md shadow-lg">
        {sections.map((section, index) => {
          const isActive = activeSection === section.id;

          return (
            <div key={section.id} className="flex items-center">
              <button
                onClick={() => scrollToSection(section.id)}
                className={`
                  relative px-3 py-1.5 rounded-full transition-all duration-300 ease-out
                  font-kode-mono font-medium text-xs
                  transform active:scale-95
                  ${
                    isActive
                      ? "text-primary scale-105"
                      : "text-foreground/60 hover:text-foreground/90 hover:bg-muted/50"
                  }
                `}
                aria-label={`Go to ${section.displayName} section`}
                aria-current={isActive ? "true" : "false"}
              >
                <span className={`relative z-10 whitespace-nowrap transition-all duration-300 ease-out ${
                  isActive ? "border-b-2 pb-1 border-primary" : "border-b-2 pb-1 border-transparent"
                }`}>
                  {section.displayName}
                </span>
              </button>

              {/* Separator dot between sections */}
              {index < sections.length - 1 && (
                <div className="w-1 h-1 mx-1 rounded-full bg-muted" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}