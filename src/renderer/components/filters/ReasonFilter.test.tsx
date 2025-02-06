import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { ReasonFilter } from './ReasonFilter';

describe('renderer/components/filters/ReasonFilter.tsx', () => {
  const updateFilter = jest.fn();

  it('should render itself & its children', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          settings: mockSettings,
          notifications: [],
        }}
      >
        <MemoryRouter>
          <ReasonFilter />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should be able to toggle reason type - none already set', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              filterReasons: [],
            },
            notifications: [],
            updateFilter,
          }}
        >
          <MemoryRouter>
            <ReasonFilter />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Mentioned'));

    expect(updateFilter).toHaveBeenCalledWith('filterReasons', 'mention', true);

    expect(
      screen.getByLabelText('Mentioned').parentNode.parentNode,
    ).toMatchSnapshot();
  });

  it('should be able to toggle reason type - some filters already set', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              filterReasons: ['security_alert'],
            },
            notifications: [],
            updateFilter,
          }}
        >
          <MemoryRouter>
            <ReasonFilter />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Mentioned'));

    expect(updateFilter).toHaveBeenCalledWith('filterReasons', 'mention', true);

    expect(
      screen.getByLabelText('Mentioned').parentNode.parentNode,
    ).toMatchSnapshot();
  });
});
