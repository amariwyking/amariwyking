import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export default function FormField({
  label,
  required = false,
  error,
  children,
  className = ""
}: FormFieldProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label className="block text-sm sm:text-base font-medium text-foreground mb-2 font-kode-mono">
        {label} {required && '*'}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm sm:text-base text-destructive font-kode-mono">{error}</p>
      )}
    </div>
  );
}