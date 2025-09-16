interface FormProgressIndicatorProps {
  message: string;
  className?: string;
}

export default function FormProgressIndicator({ message, className = "" }: FormProgressIndicatorProps) {
  return (
    <div className={`mb-4 sm:mb-6 p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-md ${className}`}>
      <p className="text-sm sm:text-base text-primary font-kode-mono">{message}</p>
    </div>
  );
}