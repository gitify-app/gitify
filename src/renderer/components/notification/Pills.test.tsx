import { render } from '@testing-library/react';
import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import type { Milestone } from '../../typesGitHub';
import { mockSingleNotification } from '../../utils/api/__mocks__/response-mocks';
import { Pills } from './Pills';

describe('renderer/components/notification/Pills.tsx', () => {
  describe('showPills disabled', () => {
    it('should not render any pills when showPills is disabled', async () => {
      const mockNotification = mockSingleNotification;

      const props = {
        notification: mockNotification,
      };

      const tree = render(
        <AppContext.Provider
          value={{
            settings: { ...mockSettings, showPills: false },
          }}
        >
          <Pills {...props} />
        </AppContext.Provider>,
      );
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

      const tree = render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
          }}
        >
          <Pills {...props} />
        </AppContext.Provider>,
      );
      expect(tree).toMatchSnapshot();
    });

    it('should render issues pill when linked to multiple issues/prs', async () => {
      const mockNotification = mockSingleNotification;
      mockNotification.subject.linkedIssues = ['#1', '#2'];

      const props = {
        notification: mockNotification,
      };

      const tree = render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
          }}
        >
          <Pills {...props} />
        </AppContext.Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });

  describe('comment pills', () => {
    it('should render when no comments', async () => {
      const mockNotification = mockSingleNotification;
      mockNotification.subject.comments = null;

      const props = {
        notification: mockNotification,
      };

      const tree = render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
          }}
        >
          <Pills {...props} />
        </AppContext.Provider>,
      );
      expect(tree).toMatchSnapshot();
    });

    it('should render when 1 comment', async () => {
      const mockNotification = mockSingleNotification;
      mockNotification.subject.comments = 1;

      const props = {
        notification: mockNotification,
      };

      const tree = render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
          }}
        >
          <Pills {...props} />
        </AppContext.Provider>,
      );
      expect(tree).toMatchSnapshot();
    });

    it('should render when more than 1 comments', async () => {
      const mockNotification = mockSingleNotification;
      mockNotification.subject.comments = 2;

      const props = {
        notification: mockNotification,
      };

      const tree = render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
          }}
        >
          <Pills {...props} />
        </AppContext.Provider>,
      );
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

      const tree = render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
          }}
        >
          <Pills {...props} />
        </AppContext.Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });

  describe('milestone pills', () => {
    it('should render open milestone pill', async () => {
      const mockNotification = mockSingleNotification;
      mockNotification.subject.milestone = {
        title: 'Milestone 1',
        state: 'open',
      } as Milestone;

      const props = {
        notification: mockNotification,
      };

      const tree = render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
          }}
        >
          <Pills {...props} />
        </AppContext.Provider>,
      );
      expect(tree).toMatchSnapshot();
    });

    it('should render closed milestone pill', async () => {
      const mockNotification = mockSingleNotification;
      mockNotification.subject.milestone = {
        title: 'Milestone 1',
        state: 'closed',
      } as Milestone;

      const props = {
        notification: mockNotification,
      };

      const tree = render(
        <AppContext.Provider
          value={{
            settings: mockSettings,
          }}
        >
          <Pills {...props} />
        </AppContext.Provider>,
      );
      expect(tree).toMatchSnapshot();
    });
  });
});
