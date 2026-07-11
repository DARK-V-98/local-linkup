import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time errors anywhere in the tree and shows a friendly
 * recovery screen instead of a white page.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  handleHome = () => {
    this.setState({ error: null });
    window.location.href = "/";
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <i className="fas fa-triangle-exclamation text-2xl text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. You can reload the page or go back
              to the home page.
            </p>
            {import.meta.env.DEV && (
              <pre className="mt-3 text-left text-xs bg-muted rounded-lg p-3 overflow-x-auto text-destructive">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
            >
              <i className="fas fa-rotate-right mr-2" />
              Reload
            </button>
            <button
              onClick={this.handleHome}
              className="px-5 py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted transition"
            >
              <i className="fas fa-house mr-2" />
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
