# Modal & Toast System Usage Guide

## ConfirmationModal

### Basic Usage

```jsx
import { useConfirmationModal } from '../hooks/useConfirmationModal';
import ConfirmationModal from '../components/ConfirmationModal';

function MyComponent() {
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationModal();

  const handleDelete = () => {
    showConfirmation({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger', // 'danger', 'warning', 'success', 'info'
      onConfirm: () => {
        // Your delete logic here
        console.log('Item deleted');
      }
    });
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      
      <ConfirmationModal
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        type={config.type}
      />
    </>
  );
}
```

### Modal Types

- **danger**: Red icon, for destructive actions (delete, remove)
- **warning**: Yellow icon, for cautionary actions (logout, discard changes)
- **success**: Green icon, for positive confirmations
- **info**: Blue icon, for general confirmations (default)

## Toast Notifications

### Basic Usage

```jsx
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

function MyComponent() {
  const { isOpen, config, hideToast, showSuccess, showError, showWarning, showInfo } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('Data saved successfully!');
    } catch (error) {
      showError('Failed to save data: ' + error.message);
    }
  };

  return (
    <>
      <button onClick={handleSave}>Save</button>
      
      <Toast
        isOpen={isOpen}
        onClose={hideToast}
        message={config.message}
        type={config.type}
        duration={config.duration}
      />
    </>
  );
}
```

### Toast Helper Methods

```jsx
// Success (3s duration, green)
showSuccess('Operation completed successfully!');

// Error (4s duration, red)
showError('Something went wrong!');

// Warning (3.5s duration, yellow)
showWarning('Please review your input');

// Info (3s duration, blue)
showInfo('Processing your request...');

// Custom duration
showSuccess('Saved!', 2000); // 2 seconds

// No auto-close (duration = 0)
showError('Critical error', 0);
```

## Migration from alert() and window.confirm()

### Before:
```jsx
if (window.confirm('Are you sure?')) {
  deleteItem();
}
alert('Item deleted!');
```

### After:
```jsx
showConfirmation({
  title: 'Confirm Delete',
  message: 'Are you sure?',
  type: 'danger',
  onConfirm: () => {
    deleteItem();
    showSuccess('Item deleted!');
  }
});
```

## Examples in Codebase

- **TimesheetsView.jsx**: Delete timesheet confirmation
- **Sidebar.jsx**: Logout confirmation
- **UserManagement.jsx**: Can be updated to use Toast for success/error messages
