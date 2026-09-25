import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'CONFIRM ACTION',
  message = 'Are you sure you want to perform this operation? This action cannot be undone.',
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  variant = 'red',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="py-2">
        <p className="text-sm font-semibold text-black mb-6">{message}</p>
        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? 'PROCESSING...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
