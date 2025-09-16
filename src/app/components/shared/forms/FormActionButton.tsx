import { ReactNode } from 'react';

interface FormActionButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
}

export default function FormActionButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = ''
}: FormActionButtonProps) {
  const baseStyles = 'font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors rounded-md font-work-sans';

  const variantStyles = {
    primary: disabled
      ? 'bg-muted cursor-not-allowed text-muted-foreground'
      : 'bg-primary hover:bg-primary/90 text-primary-foreground',
    secondary: disabled
      ? 'bg-muted cursor-not-allowed text-muted-foreground border border-border'
      : 'bg-background hover:bg-muted text-foreground border border-border',
    destructive: disabled
      ? 'bg-muted cursor-not-allowed text-muted-foreground'
      : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 sm:px-8 py-3 sm:py-2 text-sm sm:text-base',
    lg: 'px-8 py-4 text-base sm:text-lg'
  };

  const widthStyles = fullWidth ? 'w-full' : 'w-full sm:w-auto';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
    >
      {children}
    </button>
  );
}