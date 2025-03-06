import { useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface KeyboardNavigationProps {
  enabled: boolean;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: (event: KeyboardEvent) => void;
}

export const useKeyboardNavigation = ({
  enabled,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onEnter,
  onEscape,
  onTab,
}: KeyboardNavigationProps) => {
  const { preferences } = useAccessibility();

  useEffect(() => {
    if (!enabled || !preferences.keyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle keyboard events when user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowUp':
          if (onArrowUp) {
            event.preventDefault();
            onArrowUp();
          }
          break;

        case 'ArrowDown':
          if (onArrowDown) {
            event.preventDefault();
            onArrowDown();
          }
          break;

        case 'ArrowLeft':
          if (onArrowLeft) {
            event.preventDefault();
            onArrowLeft();
          }
          break;

        case 'ArrowRight':
          if (onArrowRight) {
            event.preventDefault();
            onArrowRight();
          }
          break;

        case 'Enter':
          if (onEnter) {
            event.preventDefault();
            onEnter();
          }
          break;

        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;

        case 'Tab':
          if (onTab) {
            onTab(event);
          }
          break;

        // Add quick navigation shortcuts
        case 'h':
        case 'H':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Navigate to home/dashboard
            window.location.href = '/';
          }
          break;

        case 'e':
        case 'E':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Navigate to email view
            window.location.href = '/email';
          }
          break;

        case 's':
        case 'S':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Navigate to settings
            window.location.href = '/settings';
          }
          break;

        case '?':
          if (event.shiftKey) {
            event.preventDefault();
            // Show keyboard shortcuts help
            // You can implement this by showing a modal or dialog
            console.log('Show keyboard shortcuts help');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    enabled,
    preferences.keyboardNavigation,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onEscape,
    onTab,
  ]);
}; 