import { Component, type ReactNode } from 'react';

import { EmojiSplash } from './layout/EmojiSplash';
import { ReloadButton } from './primitives/ReloadButton';

import { getErrorDetails } from '../utils/core/errors';
import { rendererLogError, toError } from '../utils/core/logger';

function AppErrorFallback() {
  const error = getErrorDetails('UNKNOWN');

  return (
    <EmojiSplash
      actions={<ReloadButton />}
      emoji={error.emojis[0]}
      fullHeight
      heading={error.title}
      subHeadings={error.descriptions}
    />
  );
}

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

/**
 * Last-resort boundary for failures outside the route tree (providers, app
 * shell bootstrap). Route failures are handled by the router error elements.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error) {
    rendererLogError('app', 'Renderer error boundary', toError(error));
  }

  override render() {
    return this.state.error ? <AppErrorFallback /> : this.props.children;
  }
}
