import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import type { GitifyMilestone } from '../../types';

import { MetricGroup, type MetricGroupProps } from './MetricGroup';

describe('renderer/components/metrics/MetricGroup.tsx', () => {
  describe('showPills disabled', () => {
    it('should not render any pills when showPills is disabled', async () => {
      const mockNotification = mockGitifyNotification;

      const props: MetricGroupProps = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />, {
        settings: { ...mockSettings, showPills: false },
      });
      expect(tree).toMatchSnapshot();
    });
  });

  describe('linked issue pills', () => {
    it('should render issues pill when linked to one issue/pr', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.linkedIssues = ['#1'];

      const props: MetricGroupProps = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render issues pill when linked to multiple issues/prs', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.linkedIssues = ['#1', '#2'];

      const props: MetricGroupProps = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('reactions pills', () => {
    it('should render reaction pill when one reaction', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.reactionsCount = 1;
      mockNotification.subject.reactionGroups = [
        {
          content: 'ROCKET',
          reactors: {
            totalCount: 1,
          },
        },
      ];

      const props: MetricGroupProps = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render reaction pill when multiple reactions', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.reactionsCount = 53;
      mockNotification.subject.reactionGroups = [
        {
          content: 'THUMBS_UP',
          reactors: {
            totalCount: 1,
          },
        },
        {
          content: 'THUMBS_DOWN',
          reactors: {
            totalCount: 1,
          },
        },
        {
          content: 'LAUGH',
          reactors: {
            totalCount: 2,
          },
        },
        {
          content: 'HOORAY',
          reactors: {
            totalCount: 3,
          },
        },
        {
          content: 'CONFUSED',
          reactors: {
            totalCount: 5,
          },
        },
        {
          content: 'ROCKET',
          reactors: {
            totalCount: 8,
          },
        },
        {
          content: 'EYES',
          reactors: {
            totalCount: 13,
          },
        },
        {
          content: 'HEART',
          reactors: {
            totalCount: 21,
          },
        },
      ];

      const props: MetricGroupProps = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render issues pill when linked to multiple issues/prs', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.linkedIssues = ['#1', '#2'];

      const props: MetricGroupProps = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('comment pills', () => {
    it('should render when no comments', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.commentCount = null;

      const props: MetricGroupProps = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render when 1 comment', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.commentCount = 1;

      const props: MetricGroupProps = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render when more than 1 comments', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.commentCount = 2;

      const props: MetricGroupProps = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('label pills', () => {
    it('should render labels pill', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.labels = ['enhancement', 'good-first-issue'];

      const props: MetricGroupProps = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('milestone pills', () => {
    it('should render open milestone pill', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.milestone = {
        title: 'Milestone 1',
        state: 'OPEN',
      } as GitifyMilestone;

      const props: MetricGroupProps = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render closed milestone pill', async () => {
      const mockNotification = mockGitifyNotification;
      mockNotification.subject.milestone = {
        title: 'Milestone 1',
        state: 'CLOSED',
      } as GitifyMilestone;

      const props: MetricGroupProps = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
