import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  message: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: Error): State {
    return { message: error.message || 'Something went wrong.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('FocusList render error', error, info.componentStack);
  }

  render() {
    if (!this.state.message) return this.props.children;
    return (
      <div className="error-fallback" role="alert">
        <h1>FocusList hit a snag</h1>
        <p>Your saved tasks are still in this browser. Reload to continue.</p>
        <button className="button primary" type="button" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }
}
