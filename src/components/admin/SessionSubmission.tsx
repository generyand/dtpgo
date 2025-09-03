'use client';

import React from 'react';
import { CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSessionFormState } from '@/components/admin/SessionFormState';

interface SubmissionStatusProps {
	className?: string;
	onCreateAnother?: () => void;
	onClose?: () => void;
}

export function SubmissionStatus({ className, onCreateAnother, onClose }: SubmissionStatusProps) {
	const { status, errorMessage, retry } = useSessionFormState();

	if (status === 'loading' || status === 'idle') return null;

	if (status === 'submitting') {
		return (
			<div className={cn('flex items-center gap-3 p-3 rounded-md border bg-card', className)}>
				<Loader2 className="h-4 w-4 animate-spin text-primary" />
				<p className="text-sm text-muted-foreground">Submitting session...</p>
			</div>
		);
	}

	if (status === 'success') {
		return (
			<div className={cn('flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-md border bg-green-50 border-green-200', className)}>
				<div className="flex items-center gap-2">
					<CheckCircle2 className="h-5 w-5 text-green-600" />
					<p className="text-sm text-green-700">Session saved successfully.</p>
				</div>
				<div className="flex gap-2 sm:ml-auto">
					{onCreateAnother && (
						<Button size="sm" variant="outline" onClick={onCreateAnother}>Create another</Button>
					)}
					{onClose && (
						<Button size="sm" onClick={onClose}>Close</Button>
					)}
				</div>
			</div>
		);
	}

	if (status === 'error') {
		return (
			<div className={cn('flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-md border bg-destructive/10 border-destructive/20', className)}>
				<div className="flex items-center gap-2">
					<XCircle className="h-5 w-5 text-destructive" />
					<p className="text-sm text-destructive">{errorMessage ?? 'Failed to submit session.'}</p>
				</div>
				{retry && (
					<Button size="sm" variant="outline" className="gap-2 sm:ml-auto" onClick={retry}>
						<RefreshCw className="h-4 w-4" /> Retry
					</Button>
				)}
			</div>
		);
	}

	return null;
}
