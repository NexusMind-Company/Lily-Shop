import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);

    // If it's a chunk loading error, we might want to reload
    if (error.message && (
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed')
    )) {
      // Small delay to avoid infinite loops if it happens immediately
      setTimeout(() => {
        const lastReload = localStorage.getItem('last-chunk-reload');
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload) > 10000) {
          localStorage.setItem('last-chunk-reload', now.toString());
          window.location.reload();
        }
      }, 500);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong.</h2>
          <p className="mb-4">We encountered an error loading this page. This often happens after a new update.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-lily text-white rounded-lg font-medium"
            style={{ backgroundColor: '#8B5CF6' }} // matching theme-color from index.html
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
