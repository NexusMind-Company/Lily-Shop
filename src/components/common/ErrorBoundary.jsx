import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "./Button";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Log error to error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full"
          >
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-error" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-text-main-dark mb-3">
                Something went wrong
              </h1>

              <p className="text-gray-600 dark:text-text-secondary-dark mb-6">
                We&apos;re sorry, but something unexpected happened. Please try
                refreshing the page or go back home.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-surface-dark rounded-xl text-left overflow-auto max-h-48">
                  <p className="text-xs font-mono text-error mb-2">
                    {this.state.error.toString()}
                  </p>
                  <pre className="text-xs text-gray-500 dark:text-gray-400">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>

                <Link to="/" className="flex-1">
                  <Button
                    variant="secondary"
                    fullWidth
                    leftIcon={<Home className="w-4 h-4" />}
                    onClick={this.handleReset}
                  >
                    Go Home
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
