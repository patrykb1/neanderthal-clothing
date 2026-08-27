import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function PopupPanelTemplate({
  open,
  onOpenChange,
  title = 'Panel Title',
  description = 'Add details for this popup panel.',
  children,
  cancelLabel = 'Cancel',
  submitLabel = 'Save Changes',
  destructiveLabel,
  onCancel,
  onSubmit,
  onDestructive,
  isDestructiveDisabled = false,
  isSubmitting = false,
  isDestructiveSubmitting = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-panel-scrollbar border-brand-brown bg-brand-forest text-brand-light-gray w-full max-w-full sm:max-w-[720px] max-h-[90vh] overflow-y-auto overflow-x-hidden px-4 sm:px-6">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wider text-brand-light-gray">{title}</DialogTitle>
          <DialogDescription className="font-body text-brand-dark-gray">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">{children}</div>

        <DialogFooter>
          {onDestructive ? (
            <button
              type="button"
              onClick={onDestructive}
              disabled={isSubmitting || isDestructiveSubmitting || isDestructiveDisabled}
              className="h-10 px-4 border border-[#5C2B2B] bg-[#2B1414] text-[#FFB3B3] font-body text-sm tracking-wide hover:bg-[#3A1717] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDestructiveSubmitting ? 'Deleting...' : (destructiveLabel || 'Delete')}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isDestructiveSubmitting}
            className="h-10 px-4 border border-brand-brown bg-transparent text-brand-stone font-body text-sm tracking-wide hover:text-white hover:border-brand-dark-gray transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isDestructiveSubmitting}
            className="h-10 px-4 bg-brand-light-gray text-brand-very-dark font-body text-sm tracking-wide hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PopupPanelField({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <div>
        <p className="font-body text-xs tracking-[0.15em] uppercase text-brand-stone">{label}</p>
        {hint ? <p className="font-body text-xs text-[#6F6F6F] mt-1">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}
