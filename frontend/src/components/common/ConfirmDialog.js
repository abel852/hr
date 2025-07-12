import React from 'react';

const ConfirmDialog = ({ open, title = 'Are you sure?', message = 'This action cannot be undone.', confirmText = 'Yes', cancelText = 'Cancel', onConfirm, onCancel, loading = false }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={loading ? undefined : onCancel} />
      <div className="relative w-full max-w-md mx-4 card p-6 animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {message && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        )}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Working...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

// commit-132: feat(ui): add customizable confirm dialog
