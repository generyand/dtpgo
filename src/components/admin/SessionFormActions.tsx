'use client';

import React, { useState, useCallback } from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSessionFormState } from '@/components/admin/SessionFormState';
import { cn } from '@/lib/utils';

interface SessionFormActionsProps {
  className?: string;
  onReset?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  isSubmitting?: boolean;
  hasUnsavedChanges?: boolean;
  resetLabel?: string;
  cancelLabel?: string;
  saveLabel?: string;
  resetConfirmationTitle?: string;
  resetConfirmationMessage?: string;
  unsavedChangesTitle?: string;
  unsavedChangesMessage?: string;
}

export function SessionFormActions({
  className,
  onReset,
  onCancel,
  onSave,
  isSubmitting = false,
  hasUnsavedChanges = false,
  resetLabel = 'Reset Form',
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  resetConfirmationTitle = 'Reset Form',
  resetConfirmationMessage = 'Are you sure you want to reset the form? All entered data will be lost.',
  unsavedChangesTitle = 'Unsaved Changes',
  unsavedChangesMessage = 'You have unsaved changes. Are you sure you want to leave?',
}: SessionFormActionsProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const { setStatus } = useSessionFormState();

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
      setStatus('idle');
    }
    setShowResetConfirm(false);
  }, [onReset, setStatus]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedConfirm(true);
    } else if (onCancel) {
      onCancel();
    }
  }, [hasUnsavedChanges, onCancel]);

  const handleCancelConfirm = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    setShowUnsavedConfirm(false);
  }, [onCancel]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave();
    }
  }, [onSave]);

  return (
    <>
      <div className={cn('flex items-center justify-between gap-4', className)}>
        <div className="flex items-center gap-2">
          {onReset && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              disabled={isSubmitting}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {resetLabel}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              {cancelLabel}
            </Button>
          )}
          {onSave && (
            <Button
              type="submit"
              onClick={handleSave}
              disabled={isSubmitting}
              className="gap-2"
            >
              {saveLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              {resetConfirmationTitle}
            </DialogTitle>
            <DialogDescription>
              {resetConfirmationMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(false)}
            >
              Keep Changes
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
            >
              Reset Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Confirmation Dialog */}
      <Dialog open={showUnsavedConfirm} onOpenChange={setShowUnsavedConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              {unsavedChangesTitle}
            </DialogTitle>
            <DialogDescription>
              {unsavedChangesMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnsavedConfirm(false)}
            >
              Continue Editing
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
            >
              Leave Without Saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Enhanced form actions with additional utilities
export function SessionFormActionsEnhanced({
  className,
  onReset,
  onCancel,
  onSave,
  isSubmitting = false,
  hasUnsavedChanges = false,
  resetLabel = 'Reset Form',
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  showReset = true,
  showCancel = true,
  showSave = true,
  resetConfirmationTitle = 'Reset Form',
  resetConfirmationMessage = 'Are you sure you want to reset the form? All entered data will be lost.',
  unsavedChangesTitle = 'Unsaved Changes',
  unsavedChangesMessage = 'You have unsaved changes. Are you sure you want to leave?',
  resetConfirmationRequired = true,
  unsavedChangesWarning = true,
}: SessionFormActionsProps & {
  showReset?: boolean;
  showCancel?: boolean;
  showSave?: boolean;
  resetConfirmationRequired?: boolean;
  unsavedChangesWarning?: boolean;
}) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const { setStatus } = useSessionFormState();

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
      setStatus('idle');
    }
    setShowResetConfirm(false);
  }, [onReset, setStatus]);

  const handleCancel = useCallback(() => {
    if (unsavedChangesWarning && hasUnsavedChanges) {
      setShowUnsavedConfirm(true);
    } else if (onCancel) {
      onCancel();
    }
  }, [unsavedChangesWarning, hasUnsavedChanges, onCancel]);

  const handleCancelConfirm = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    setShowUnsavedConfirm(false);
  }, [onCancel]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave();
    }
  }, [onSave]);

  const handleResetClick = useCallback(() => {
    if (resetConfirmationRequired) {
      setShowResetConfirm(true);
    } else if (onReset) {
      onReset();
      setStatus('idle');
    }
  }, [resetConfirmationRequired, onReset, setStatus]);

  return (
    <>
      <div className={cn('flex items-center justify-between gap-4', className)}>
        <div className="flex items-center gap-2">
          {showReset && onReset && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetClick}
              disabled={isSubmitting}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {resetLabel}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showCancel && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              {cancelLabel}
            </Button>
          )}
          {showSave && onSave && (
            <Button
              type="submit"
              onClick={handleSave}
              disabled={isSubmitting}
              className="gap-2"
            >
              {saveLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {resetConfirmationRequired && (
        <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-orange-600" />
                {resetConfirmationTitle}
              </DialogTitle>
              <DialogDescription>
                {resetConfirmationMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(false)}
              >
                Keep Changes
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
              >
                Reset Form
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Unsaved Changes Confirmation Dialog */}
      {unsavedChangesWarning && (
        <Dialog open={showUnsavedConfirm} onOpenChange={setShowUnsavedConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                {unsavedChangesTitle}
              </DialogTitle>
              <DialogDescription>
                {unsavedChangesMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUnsavedConfirm(false)}
              >
                Continue Editing
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelConfirm}
              >
                Leave Without Saving
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
