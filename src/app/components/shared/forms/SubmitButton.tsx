import FormActionButton from './FormActionButton';

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
  return (
    <div className={`flex justify-end pt-4 sm:pt-6 ${className}`}>
      <FormActionButton
        type="submit"
        variant="primary"
        size="md"
        fullWidth={fullWidth}
        disabled={isSubmitting || disabled}
      >
        {isSubmitting ? (loadingText || 'Submitting...') : submitText}
      </FormActionButton>
    </div>
  );
}