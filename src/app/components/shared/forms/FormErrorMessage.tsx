interface FormErrorMessageProps {
  message: string;
  className?: string;
}

export default function FormErrorMessage({ message, className = "" }: FormErrorMessageProps) {
  return (
    <div className={`mb-4 sm:mb-6 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-md ${className}`}>
      <p className="text-sm sm:text-base text-destructive font-kode-mono">{message}</p>
    </div>
  );
}