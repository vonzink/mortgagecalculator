// src/components/ErrorBoundary.tsx
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    className="p-6 bg-red-50 border border-red-200 rounded-lg text-center"
                    role="alert"
                    aria-live="assertive"
                >
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                        Something went wrong
                    </h3>
                    <p className="text-red-600 text-sm mb-4">
                        Unable to display this component. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Chart-specific error boundary with custom fallback
export function ChartErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            fallback={
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <p className="text-gray-600">
                        Unable to render chart. The data may be invalid or the chart component failed to load.
                    </p>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    );
}
