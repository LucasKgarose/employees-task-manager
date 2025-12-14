import { useState } from 'react';

/**
 * Custom hook for managing toast notifications
 * @returns {object} - Toast state and control functions
 */
export function useToast() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    message: '',
    type: 'info',
    duration: 3000
  });

  const showToast = (message, type = 'info', duration = 3000) => {
    setConfig({ message, type, duration });
    setIsOpen(true);
  };

  const hideToast = () => {
    setIsOpen(false);
  };

  const showSuccess = (message, duration = 3000) => {
    showToast(message, 'success', duration);
  };

  const showError = (message, duration = 4000) => {
    showToast(message, 'error', duration);
  };

  const showWarning = (message, duration = 3500) => {
    showToast(message, 'warning', duration);
  };

  const showInfo = (message, duration = 3000) => {
    showToast(message, 'info', duration);
  };

  return {
    toast: {
      isOpen,
      message: config.message,
      type: config.type,
      duration: config.duration
    },
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}
