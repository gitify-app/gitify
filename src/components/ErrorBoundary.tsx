import { Component, type ReactNode } from 'react';

import { AlertIcon, SyncIcon } from '@primer/octicons-react';
import { Button, Stack, Text } from '@primer/react';

import { APPLICATION } from '../shared/constants';
import { logError } from '../shared/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError('ErrorBoundary', 'Caught an error', error, [
      errorInfo.componentStack ?? '',
    ]);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Stack
          align="center"
          className="h-screen bg-gitify-background text-gitify-font p-8"
          direction="vertical"
          gap="normal"
          justify="center"
        >
          <AlertIcon className="text-red-500" size={48} />
          <Text as="h2" className="text-xl font-semibold">
            Something went wrong
          </Text>
          <Text as="p" className="text-center text-gitify-font-muted max-w-md">
            {APPLICATION.NAME} encountered an unexpected error. This is usually
            temporary and can be resolved by retrying.
          </Text>
          {this.state.error && (
            <Text
              as="code"
              className="text-xs bg-gray-800 p-2 rounded max-w-md overflow-auto"
            >
              {this.state.error.message}
            </Text>
          )}
          <Button leadingVisual={SyncIcon} onClick={this.handleRetry}>
            Retry
          </Button>
        </Stack>
      );
    }

    return this.props.children;
  }
}
