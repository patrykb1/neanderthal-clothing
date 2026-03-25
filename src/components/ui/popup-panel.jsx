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
      <DialogContent className="admin-panel-scrollbar border-[#2C2C2C] bg-[#141414] text-[#D4D4D4] sm:max-w-[560px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wider text-[#CBCBCB]">{title}</DialogTitle>
          <DialogDescription className="font-body text-[#8B8B8B]">{description}</DialogDescription>
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
            className="h-10 px-4 border border-[#2C2C2C] bg-transparent text-[#A0A0A0] font-body text-sm tracking-wide hover:text-white hover:border-[#8B8B8B] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isDestructiveSubmitting}
            className="h-10 px-4 bg-[#D4D4D4] text-[#0D0D0D] font-body text-sm tracking-wide hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
        <p className="font-body text-xs tracking-[0.15em] uppercase text-[#A0A0A0]">{label}</p>
        {hint ? <p className="font-body text-xs text-[#6F6F6F] mt-1">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}
