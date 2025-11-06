import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
        <p className="text-muted-foreground">
          Please refresh the page or contact a facilitator for help.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left mt-4 p-4 bg-muted rounded-md">
            <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
            <pre className="text-xs overflow-auto">{error.message}</pre>
          </details>
        )}
        <div className="flex gap-2 justify-center">
          <Button onClick={resetErrorBoundary} variant="outline">
            Try again
          </Button>
          <Button onClick={() => window.location.reload()} variant="default">
            Refresh page
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback: React.ComponentType<ErrorFallbackProps> }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback: React.ComponentType<ErrorFallbackProps> }>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return <FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

