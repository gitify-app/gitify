import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BaseStyles, ThemeProvider } from '@primer/react';

import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { type ITooltip, Tooltip } from './Tooltip';

describe('renderer/components/fields/Tooltip.tsx', () => {
  const props: ITooltip = {
    name: 'test',
    tooltip: 'This is some tooltip text',
  };

  it('should render', () => {
    render(
      <ThemeProvider>
        <BaseStyles>
          <AppContext.Provider
            value={{
              settings: mockSettings,
            }}
          >
            <Tooltip {...props} />
          </AppContext.Provider>
        </BaseStyles>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('tooltip-test')).toBeInTheDocument();
  });

  it('should display on mouse enter / leave', async () => {
    render(
      <ThemeProvider>
        <BaseStyles>
          <AppContext.Provider
            value={{
              settings: mockSettings,
            }}
          >
            <Tooltip {...props} />
          </AppContext.Provider>
        </BaseStyles>
      </ThemeProvider>,
    );

    const tooltipElement = screen.getByTestId('tooltip-test');

    await userEvent.hover(tooltipElement);
    expect(screen.queryByText(props.tooltip as string)).toBeInTheDocument();

    await userEvent.unhover(tooltipElement);
    expect(screen.queryByText(props.tooltip as string)).not.toBeInTheDocument();
  });
});
