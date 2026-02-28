import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', backgroundColor: '#fee', color: '#900', height: '100%', minHeight: '500px', overflow: 'auto', borderRadius: '8px', border: '1px solid #c00' }}>
                    <h2>Component Crashed</h2>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Click for exact error details to show the AI</summary>
                        <br />
                        <strong>Error:</strong> {this.state.error?.toString()}
                        <br /><br />
                        <strong>Component Stack:</strong>
                        <br />
                        {this.state.errorInfo?.componentStack}
                    </details>
                    <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Reload Page</button>
                </div>
            );
        }

        return this.props.children;
    }
}
