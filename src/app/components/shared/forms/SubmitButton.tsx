interface SubmitButtonProps {
  isSubmitting: boolean;
  loadingText?: string;
  submitText: string;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function SubmitButton({
  isSubmitting,
  loadingText,
  submitText,
  fullWidth = false,
  className = "",
  disabled = false
}: SubmitButtonProps) {
  const isDisabled = isSubmitting || disabled;

  return (
    <div className={`flex justify-end pt-4 sm:pt-6 ${className}`}>
      <button
        type="submit"
        disabled={isDisabled}
        className={`${fullWidth ? 'w-full' : 'w-full sm:w-auto'} px-6 sm:px-8 py-3 sm:py-2 text-sm sm:text-base rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors ${
          isDisabled
            ? 'bg-muted cursor-not-allowed text-muted-foreground'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        }`}
      >
        <span className="font-work-sans">
          {isSubmitting ? (loadingText || 'Submitting...') : submitText}
        </span>
      </button>
    </div>
  );
}