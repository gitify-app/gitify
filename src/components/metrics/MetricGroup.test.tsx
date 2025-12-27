import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockSettings } from '../../__mocks__/state-mocks';
import type { GitifyMilestone } from '../../types';
import { mockSingleNotification } from '../../utils/api/__mocks__/response-mocks';
import { MetricGroup } from './MetricGroup';

describe('renderer/components/metrics/MetricGroup.tsx', () => {
  describe('showPills disabled', () => {
    it('should not render any pills when showPills is disabled', async () => {
      const mockNotification = mockSingleNotification;

      const props = {
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
      const mockNotification = mockSingleNotification;
      mockNotification.subject.linkedIssues = ['#1'];

      const props = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render issues pill when linked to multiple issues/prs', async () => {
      const mockNotification = mockSingleNotification;
      mockNotification.subject.linkedIssues = ['#1', '#2'];

      const props = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('comment pills', () => {
    it('should render when no comments', async () => {
      const mockNotification = mockSingleNotification;
      mockNotification.subject.comments = undefined;

      const props = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render when 1 comment', async () => {
      const mockNotification = mockSingleNotification;
      mockNotification.subject.comments = 1;

      const props = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render when more than 1 comments', async () => {
      const mockNotification = mockSingleNotification;
      mockNotification.subject.comments = 2;

      const props = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('label pills', () => {
    it('should render labels pill', async () => {
      const mockNotification = mockSingleNotification;
      mockNotification.subject.labels = ['enhancement', 'good-first-issue'];

      const props = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('milestone pills', () => {
    it('should render open milestone pill', async () => {
      const mockNotification = mockSingleNotification;
      mockNotification.subject.milestone = {
        title: 'Milestone 1',
        state: 'OPEN',
      } as GitifyMilestone;

      const props = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('should render closed milestone pill', async () => {
      const mockNotification = mockSingleNotification;
      mockNotification.subject.milestone = {
        title: 'Milestone 1',
        state: 'CLOSED',
      } as GitifyMilestone;

      const props = {
        notification: mockNotification,
      };

      const tree = renderWithAppContext(<MetricGroup {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
