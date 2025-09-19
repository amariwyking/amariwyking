"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className = "" }: NavigationProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  const navigationItems = [
    {
      name: "Home",
      href: "/",
      isActive: pathname === "/",
    },
    {
      name: "Gallery",
      href: "/gallery",
      isActive: pathname.startsWith("/gallery"),
    },
    {
      name: "Blog",
      href: "/blog",
      isActive: pathname.startsWith("/blog"),
    },
  ];

  const currentPage = navigationItems.find(item => item.isActive);

  const handleMouseEnter = () => setIsExpanded(true);
  const handleMouseLeave = () => setIsExpanded(false);

  const handleClick = () => setIsExpanded(!isExpanded);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle scroll-based visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 10; // Minimum scroll distance to trigger hide/show

      if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
        return;
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down and past 100px - hide navigation
        setIsVisible(false);
        setIsExpanded(false); // Also close menu when hiding
      } else {
        // Scrolling up or near top - show navigation
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close menu when navigation occurs
  const handleNavigation = () => {
    setIsExpanded(false);
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-6 left-6 z-50 transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-2 pointer-events-none'
      } ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${
          isExpanded ? 'bg-background/60 backdrop-blur-md border-border rounded-lg shadow-sm' : ''
        }`}
      >
        <div className="flex flex-col gap-1 p-3">
          {/* Current page - always at the top */}
          <div className={`px-3 py-2 rounded-md font-kode-mono font-medium text-base sm:text-lg md:text-xl text-left whitespace-nowrap ${isExpanded ? 'text-primary' : 'text-foreground/90'}`}>
            {currentPage?.name || "Home"}
          </div>

          {/* Other navigation items - only show when expanded */}
          <div
            className={`transition-all duration-300 ease-out ${
              isExpanded
                ? 'opacity-100 max-h-32'
                : 'opacity-0 max-h-0'
            }`}
          >
            <div className="flex flex-col gap-1">
              {navigationItems.filter(item => !item.isActive).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavigation}
                  className="px-3 py-2 rounded-md font-kode-mono font-medium transition-colors duration-200 text-base sm:text-lg md:text-xl text-left text-foreground/60 hover:text-primary whitespace-nowrap"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}