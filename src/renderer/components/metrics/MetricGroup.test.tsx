import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import { IconColor, type Link } from '../../types';

import { MetricGroup, type MetricGroupProps } from './MetricGroup';

describe('renderer/components/metrics/MetricGroup.tsx', () => {
  it('does not render any pills when showPills is disabled', async () => {
    const mockNotification = mockGitifyNotification;
    const props: MetricGroupProps = {
      notification: mockNotification,
    };

    const tree = renderWithProviders(<MetricGroup {...props} />, {
      settings: { ...mockSettings, showPills: false },
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('renders pills when showPills is enabled', async () => {
    const mockNotification = mockGitifyNotification;
    const props: MetricGroupProps = {
      notification: mockNotification,
    };

    const tree = renderWithProviders(<MetricGroup {...props} />, {
      settings: { ...mockSettings, showPills: true },
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('renders the issue type pill when the subject has a native issue type', async () => {
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

  it('renders the parent pill when the subject has a parent issue', async () => {
    const props: MetricGroupProps = {
      notification: {
        ...mockGitifyNotification,
        subject: {
          ...mockGitifyNotification.subject,
          parentIssue: {
            number: 456,
            title: 'Parent Epic',
            url: 'https://github.com/gitify-app/gitify/issues/456' as Link,
          },
        },
      },
    };

    const tree = renderWithProviders(<MetricGroup {...props} />, {
      settings: { ...mockSettings, showPills: true },
    });

    expect(tree.getByText('#456')).toBeInTheDocument();
  });

  it('renders the sub-issue progress pill when the subject has sub-issue progress', async () => {
    const props: MetricGroupProps = {
      notification: {
        ...mockGitifyNotification,
        subject: {
          ...mockGitifyNotification.subject,
          subIssueProgress: {
            total: 5,
            completed: 2,
            percentCompleted: 40,
          },
        },
      },
    };

    const tree = renderWithProviders(<MetricGroup {...props} />, {
      settings: { ...mockSettings, showPills: true },
    });

    expect(tree.getByText('2/5')).toBeInTheDocument();
  });

  const hierarchyNotification = () => ({
    ...mockGitifyNotification,
    subject: {
      ...mockGitifyNotification.subject,
      issueType: { name: 'Bug', color: IconColor.RED },
      parentIssue: {
        number: 456,
        title: 'Parent Epic',
        url: 'https://github.com/gitify-app/gitify/issues/456' as Link,
      },
      subIssueProgress: { total: 5, completed: 2, percentCompleted: 40 },
    },
  });

  it('keeps hierarchy and existing metrics together', () => {
    const tree = renderWithProviders(<MetricGroup notification={hierarchyNotification()} />, {
      settings: { ...mockSettings, showPills: true },
    });

    expect(tree.getByText('Bug')).toBeInTheDocument();
    expect(tree.getByText('#456')).toBeInTheDocument();
    expect(tree.getByText('2/5')).toBeInTheDocument();
  });

  it('orders pills from classification to hierarchy to activity', () => {
    const tree = renderWithProviders(
      <MetricGroup
        notification={{
          ...hierarchyNotification(),
          subject: {
            ...hierarchyNotification().subject,
            checks: { state: 'FAILURE', passed: 9, failed: 1, pending: 0, total: 10 },
            commentCount: 3,
          },
        }}
      />,
      { settings: { ...mockSettings, showPills: true } },
    );

    const ordered = [
      tree.getByText('Bug'),
      tree.getByText('#456'),
      tree.getByText('2/5'),
      tree.getByText('9/10'),
      tree.getByText('3'),
    ];

    for (let i = 1; i < ordered.length; i++) {
      expect(
        ordered[i - 1].compareDocumentPosition(ordered[i]) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it('hides metrics when pills are disabled', () => {
    const tree = renderWithProviders(<MetricGroup notification={hierarchyNotification()} />, {
      settings: { ...mockSettings, showPills: false },
    });

    expect(tree.container).toBeEmptyDOMElement();
  });

  it('renders issue field pills immediately before label pills', async () => {
    const props: MetricGroupProps = {
      notification: {
        ...mockGitifyNotification,
        subject: {
          ...mockGitifyNotification.subject,
          issueFields: [{ name: 'Priority', value: 'High', fillColor: '#cf222e' }],
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

  it('does not render field pills when showPills is disabled', async () => {
    const props: MetricGroupProps = {
      notification: {
        ...mockGitifyNotification,
        subject: {
          ...mockGitifyNotification.subject,
          issueFields: [{ name: 'Priority', value: 'High', fillColor: '#cf222e' }],
        },
      },
    };

    const tree = renderWithProviders(<MetricGroup {...props} />, {
      settings: { ...mockSettings, showPills: false },
    });

    expect(tree.queryByText('Priority: High')).not.toBeInTheDocument();
  });
});
