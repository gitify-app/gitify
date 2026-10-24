import { render } from '@testing-library/react';
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { NotificationRow } from './NotificationRow';

// Exercise the real actions hook (globally mocked in vitest.setup): a row must
// obtain its actions without becoming an observer of the notifications query.
vi.unmock('../../hooks/notifications/useNotificationActions');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchInterval: false,
      },
    },
  });

  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe('renderer/components/notifications/NotificationRow.tsx - subscriptions', () => {
  it('renders without subscribing to the notifications query', () => {
    const { queryClient, wrapper } = createWrapper();

    render(
      <NotificationRow
        notification={mockGitifyNotification}
        isAnimatingExit={false}
        onAnimateExit={vi.fn()}
      />,
      { wrapper },
    );

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it('adds no query observers no matter how many rows are mounted', () => {
    const { queryClient, wrapper } = createWrapper();

    render(
      <>
        {Array.from({ length: 50 }, (_, index) => (
          <NotificationRow
            key={index}
            notification={{ ...mockGitifyNotification, id: `${index}` }}
            isAnimatingExit={false}
            onAnimateExit={vi.fn()}
          />
        ))}
      </>,
      { wrapper },
    );

    const observers = queryClient
      .getQueryCache()
      .getAll()
      .flatMap((query) => query.observers);

    expect(observers).toHaveLength(0);
  });
});
