import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardHeader, CardBody } from './ui/Card';
import { Button } from './ui/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-white">
          <Card className="max-w-md w-full border-red-500/20 bg-red-950/10">
            <CardHeader className="border-red-500/10">
              <h2 className="text-xl font-bold text-red-400">Kitchen Fire! (Render Error)</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <p className="text-sm text-gray-400">
                The recipe renderer encountered a sudden issue. This might be due to incomplete data parsing or connection lag.
              </p>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 overflow-x-auto max-h-40">
                <code className="text-xs text-red-300 block whitespace-pre-wrap">
                  {this.state.error?.message || 'Unknown error'}
                </code>
              </div>
              <Button variant="primary" onClick={this.handleReset} className="w-full">
                Return to Dashboard
              </Button>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
