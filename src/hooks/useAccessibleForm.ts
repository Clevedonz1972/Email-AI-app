import { useRef, useEffect } from 'react';

interface UseAccessibleFormProps {
  onError?: () => void;
  onSuccess?: () => void;
  focusOnError?: boolean;
}

export const useAccessibleForm = ({ onError, onSuccess, focusOnError = true }: UseAccessibleFormProps = {}) => {
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        formRef.current?.reset();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleError = () => {
    if (focusOnError && errorRef.current) {
      errorRef.current.focus();
    }
    onError?.();
  };

  const handleSuccess = () => {
    if (successRef.current) {
      successRef.current.focus();
    }
    onSuccess?.();
  };

  return {
    errorRef,
    successRef,
    formRef,
    handleError,
    handleSuccess
  };
}; 