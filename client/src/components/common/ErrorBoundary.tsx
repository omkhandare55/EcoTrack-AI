import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
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
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span style={{ fontSize: '4rem', marginBottom: '1rem' }} aria-hidden="true">
            ⚠️
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '2rem' }}>
            We're sorry for the inconvenience. The application encountered an unexpected error.
          </p>
          <div
            style={{
              maxHeight: '150px',
              overflow: 'auto',
              padding: '1rem',
              backgroundColor: 'rgba(255, 0, 0, 0.05)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 0, 0, 0.1)',
              fontSize: '0.85rem',
              color: 'var(--danger)',
              marginBottom: '2rem',
              width: '100%',
              maxWidth: '600px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {this.state.error?.toString()}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.handleReload}
            style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
