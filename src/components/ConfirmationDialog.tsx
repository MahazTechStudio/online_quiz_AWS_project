import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { cn } from '@/utils/cn';
import {
  AlertTriangle,
  AlertCircle,
  Info,
} from 'lucide-react';

type ConfirmIcon = 'warning' | 'danger' | 'info';
type ConfirmVariant = 'primary' | 'danger' | 'success';

export interface ConfirmationDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: ConfirmVariant;
  confirmLoading?: boolean;
  icon?: ConfirmIcon;
}

const iconConfig: Record<ConfirmIcon, { Component: React.FC<{ className?: string }>; className: string }> = {
  warning: {
    Component: AlertTriangle,
    className: 'bg-warning-50 text-warning-600',
  },
  danger: {
    Component: AlertCircle,
    className: 'bg-error-50 text-error-600',
  },
  info: {
    Component: Info,
    className: 'bg-primary-50 text-primary-600',
  },
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  confirmLoading = false,
  icon = 'warning',
}) => {
  const { Component: IconComponent, className: iconClass } = iconConfig[icon];

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={confirmLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={confirmLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className={cn('rounded-full p-3 mb-4', iconClass)}>
          <IconComponent className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-dark-900 mb-2">{title}</h3>
        <div className="text-sm text-slate-500">{description}</div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
