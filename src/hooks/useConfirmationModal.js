import { useState } from 'react';

/**
 * Custom hook for managing confirmation modal state
 * @returns {object} - Modal state and control functions
 */
export function useConfirmationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: 'Confirm Action',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info',
    onConfirm: null
  });

  const showConfirmation = ({
    title = 'Confirm Action',
    message = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info',
    onConfirm
  }) => {
    setConfig({
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm
    });
    setIsOpen(true);
  };

  const hideConfirmation = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    if (config.onConfirm) {
      config.onConfirm();
    }
    hideConfirmation();
  };

  return {
    isOpen,
    config,
    showConfirmation,
    hideConfirmation,
    handleConfirm
  };
}
