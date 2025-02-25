import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAccountNotifications } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import type { SettingsState } from '../../types';
import { SubjectTypeFilter } from './SubjectTypeFilter';

describe('renderer/components/filters/SubjectTypeFilter.tsx', () => {
  const updateFilter = jest.fn();

  it('should render itself & its children', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          settings: {
            ...mockSettings,
          } as SettingsState,
          notifications: mockAccountNotifications,
        }}
      >
        <MemoryRouter>
          <SubjectTypeFilter />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should be able to toggle subject type - none already set', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              filterSubjectTypes: [],
            },
            notifications: [],
            updateFilter,
          }}
        >
          <MemoryRouter>
            <SubjectTypeFilter />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Issue'));

    expect(updateFilter).toHaveBeenCalledWith(
      'filterSubjectTypes',
      'Issue',
      true,
    );

    expect(
      screen.getByLabelText('Issue').parentNode.parentNode,
    ).toMatchSnapshot();
  });

  it('should be able to toggle subject type - some filters already set', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              filterSubjectTypes: ['Issue'],
            },
            notifications: [],
            updateFilter,
          }}
        >
          <MemoryRouter>
            <SubjectTypeFilter />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Pull Request'));

    expect(updateFilter).toHaveBeenCalledWith(
      'filterSubjectTypes',
      'PullRequest',
      true,
    );

    expect(
      screen.getByLabelText('Pull Request').parentNode.parentNode,
    ).toMatchSnapshot();
  });
});
