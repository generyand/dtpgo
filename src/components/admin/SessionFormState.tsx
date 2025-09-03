'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, Info, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type StatusType = 'idle' | 'loading' | 'submitting' | 'success' | 'error';

interface SessionFormStateContextValue {
	status: StatusType;
	isDirty: boolean;
	errorMessage?: string;
	setDirty: (dirty: boolean) => void;
	setStatus: (status: StatusType, errorMessage?: string) => void;
	retry?: () => void;
}

const SessionFormStateContext = createContext<SessionFormStateContextValue | null>(null);

export function useSessionFormState(): SessionFormStateContextValue {
	const ctx = useContext(SessionFormStateContext);
	if (!ctx) {
		throw new Error('useSessionFormState must be used within SessionFormState');
	}
	return ctx;
}

interface SessionFormStateProps {
	children: React.ReactNode;
	className?: string;
	initialDirty?: boolean;
	initialStatus?: StatusType;
	onRetry?: () => void;
	showOverlay?: boolean;
}

export function SessionFormState({
	children,
	className,
	initialDirty = false,
	initialStatus = 'idle',
	onRetry,
	showOverlay = true,
}: SessionFormStateProps) {
	const [status, setStatusState] = useState<StatusType>(initialStatus);
	const [isDirty, setDirty] = useState<boolean>(initialDirty);
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

	const setStatus = useCallback((next: StatusType, error?: string) => {
		setStatusState(next);
		setErrorMessage(error);
	}, []);

	const value = useMemo<SessionFormStateContextValue>(() => ({
		status,
		isDirty,
		errorMessage,
		setDirty,
		setStatus,
		retry: onRetry,
	}), [status, isDirty, errorMessage, onRetry, setStatus]);

	return (
		<SessionFormStateContext.Provider value={value}>
			<div className={cn('relative', className)}>
				{children}
				{showOverlay && (status === 'loading' || status === 'submitting') && (
					<BlockingOverlay status={status} />
				)}
				{status === 'error' && errorMessage && (
					<ErrorBanner message={errorMessage} onRetry={onRetry} />
				)}
			</div>
		</SessionFormStateContext.Provider>
	);
}

export function DirtyStateNotice({ className }: { className?: string }) {
	const { isDirty } = useSessionFormState();
	if (!isDirty) return null;
	return (
		<div className={cn('flex items-center gap-2 p-2 rounded-md border bg-amber-50 border-amber-200', className)}>
			<Info className="h-4 w-4 text-amber-600" />
			<p className="text-sm text-amber-700">You have unsaved changes.</p>
		</div>
	);
}

export function ErrorBanner({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
	return (
		<div className={cn('mt-3 flex items-start gap-3 p-3 rounded-md border bg-destructive/10 border-destructive/20', className)}>
			<AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
			<div className="flex-1">
				<p className="text-sm text-destructive">{message}</p>
				{onRetry && (
					<div className="mt-2">
						<Button size="sm" variant="outline" onClick={onRetry} className="gap-2">
							<RefreshCw className="h-4 w-4" /> Retry
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

export function BlockingOverlay({ status = 'loading' as StatusType, message }: { status?: StatusType; message?: string }) {
	const isSubmitting = status === 'submitting';
	return (
		<div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
			<div className="flex items-center gap-3 rounded-md border bg-card px-4 py-3 shadow-sm">
				<Loader2 className={cn('h-5 w-5 animate-spin', isSubmitting ? 'text-primary' : 'text-muted-foreground')} />
				<p className="text-sm text-foreground">
					{message ?? (isSubmitting ? 'Submitting session...' : 'Loading...')}
				</p>
			</div>
		</div>
	);
}

// Lightweight error boundary for form subtree
class FormErrorBoundaryImpl extends React.Component<
	{ children: React.ReactNode; fallback?: React.ReactNode; onError?: (error: Error) => void },
	{ hasError: boolean; message?: string }
> {
	constructor(props: any) {
		super(props);
		this.state = { hasError: false };
	}
	static getDerivedStateFromError(error: Error) {
		return { hasError: true, message: error.message };
	}
	componentDidCatch(error: Error) {
		this.props.onError?.(error);
	}
	render() {
		if (this.state.hasError) {
			return this.props.fallback ?? (
				<div className="p-3 rounded-md border bg-destructive/10 border-destructive/20">
					<p className="text-sm text-destructive">{this.state.message ?? 'Something went wrong in the form.'}</p>
				</div>
			);
		}
		return this.props.children;
	}
}

export function FormErrorBoundary({ children, onError }: { children: React.ReactNode; onError?: (error: Error) => void }) {
	return (
		<FormErrorBoundaryImpl onError={onError}>
			{children}
		</FormErrorBoundaryImpl>
	);
}

// Convenience helpers to toggle states from anywhere in the subtree
export function useSessionFormStateActions() {
	const { setDirty, setStatus } = useSessionFormState();
	return { setDirty, setStatus };
}
