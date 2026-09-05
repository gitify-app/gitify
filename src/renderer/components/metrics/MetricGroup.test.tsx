import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import { IconColor } from '../../types';

import { MetricGroup, type MetricGroupProps } from './MetricGroup';

describe('renderer/components/metrics/MetricGroup.tsx', () => {
  it('should not render any pills when showPills is disabled', async () => {
    const mockNotification = mockGitifyNotification;
    const props: MetricGroupProps = {
      notification: mockNotification,
    };

    const tree = renderWithProviders(<MetricGroup {...props} />, {
      settings: { ...mockSettings, showPills: false },
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render pills when showPills is enabled', async () => {
    const mockNotification = mockGitifyNotification;
    const props: MetricGroupProps = {
      notification: mockNotification,
    };

    const tree = renderWithProviders(<MetricGroup {...props} />, {
      settings: { ...mockSettings, showPills: true },
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render the issue type pill when the subject has a native issue type', async () => {
    const props: MetricGroupProps = {
      notification: {
        ...mockGitifyNotification,
        subject: {
          ...mockGitifyNotification.subject,
          issueType: { name: 'Bug', color: IconColor.RED },
        },
      },
    };

    const tree = renderWithProviders(<MetricGroup {...props} />, {
      settings: { ...mockSettings, showPills: true },
    });

    expect(tree.getByText('Bug')).toBeInTheDocument();
  });

  it('should render the stacked PR pill when the subject is part of a stack', async () => {
    const props: MetricGroupProps = {
      notification: {
        ...mockGitifyNotification,
        subject: {
          ...mockGitifyNotification.subject,
          isStacked: true,
          stackPosition: 2,
          stackDepth: 3,
        },
      },
    };

    const tree = renderWithProviders(<MetricGroup {...props} />, {
      settings: { ...mockSettings, showPills: true },
    });

    expect(tree.getByText('2/3')).toBeInTheDocument();
  });

  it('should render issue field pills immediately before label pills', async () => {
    const props: MetricGroupProps = {
      notification: {
        ...mockGitifyNotification,
        subject: {
          ...mockGitifyNotification.subject,
          issueFields: [{ name: 'Priority', value: 'High', color: 'cf222e' }],
          labels: [{ name: 'enhancement', color: '0e8a16' }],
        },
      },
    };

    const tree = renderWithProviders(<MetricGroup {...props} />, {
      settings: { ...mockSettings, showPills: true },
    });

    const textContent = tree.container.textContent;
    expect(textContent).toContain('Priority: High');
    expect(textContent).toContain('enhancement');
    expect(textContent.indexOf('Priority: High')).toBeLessThan(textContent.indexOf('enhancement'));
  });

  it('should not render field pills when showPills is disabled', async () => {
    const props: MetricGroupProps = {
      notification: {
        ...mockGitifyNotification,
        subject: {
          ...mockGitifyNotification.subject,
          issueFields: [{ name: 'Priority', value: 'High', color: 'cf222e' }],
        },
      },
    };

    const tree = renderWithProviders(<MetricGroup {...props} />, {
      settings: { ...mockSettings, showPills: false },
    });

    expect(tree.queryByText('Priority: High')).not.toBeInTheDocument();
  });
});
