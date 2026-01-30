import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 text-center">
          <div className="rounded-full bg-red-100 p-3 sm:p-4 text-red-600">
            <AlertTriangle size={32} className="sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
          </div>
          <h1 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mt-1.5 sm:mt-2 max-w-md text-sm sm:text-base text-slate-600">
            We encountered an unexpected error. Please try reloading the page.
          </p>
          <div className="mt-6 sm:mt-8">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-blue-700"
            >
              <RefreshCw size={16} className="sm:w-[18px] sm:h-[18px]" />
              Reload Page
            </button>
          </div>
          {this.state.error && (
            <div className="mt-6 sm:mt-8 w-full max-w-lg overflow-hidden rounded-lg sm:rounded-xl border border-slate-200 bg-white p-3 sm:p-4 text-left shadow-sm">
              <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Error Details</p>
              <pre className="overflow-auto whitespace-pre-wrap rounded-md sm:rounded-lg border border-slate-100 bg-slate-50 p-2 sm:p-3 font-mono text-[10px] sm:text-xs text-slate-600">
                {this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
