import { ReactNode } from 'react';

interface FormLayoutProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function FormLayout({ title, children, className = "" }: FormLayoutProps) {
  return (
    <div className={`w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 overflow-hidden ${className}`}>
      <div className="w-full max-w-4xl mx-auto min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-6 sm:mb-8 font-kode-mono">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}