import { act, fireEvent, render, waitFor } from '@testing-library/react';

import { getVisibleCount, MetricPills } from './MetricPills';

const pills = Array.from({ length: 5 }, (_, index) => <span key={index}>pill-{index}</span>);

function mockOverflowLayout() {
  const clientWidth = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);
  const rect = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      const inStrip = this.closest('[data-testid="metric-pills"]') !== null;
      const width = inStrip ? 40 : 0;

      return {
        bottom: 20,
        height: 20,
        left: 0,
        right: width,
        toJSON: () => ({}),
        top: 0,
        width,
        x: 0,
        y: 0,
      } as DOMRect;
    });

  return () => {
    clientWidth.mockRestore();
    rect.mockRestore();
  };
}

describe('renderer/components/metrics/MetricPills.tsx', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders every pill when layout is unavailable', () => {
    const tree = render(<MetricPills pills={pills} />);

    for (let index = 0; index < pills.length; index += 1) {
      expect(tree.getByText(`pill-${index}`)).toBeInTheDocument();
    }
    expect(tree.queryByTestId('metric-overflow')).not.toBeInTheDocument();
  });

  it('collapses pills that do not fit and reveals them on hover', async () => {
    const restoreLayout = mockOverflowLayout();
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
        disconnect = disconnect;
      },
    );

    const tree = render(<MetricPills pills={pills} />);

    const overflow = tree.getByTestId('metric-overflow');
    expect(overflow).toHaveTextContent('2');
    expect(
      tree.container.querySelectorAll('[data-testid="metric-pills"] > [aria-hidden="true"]'),
    ).toHaveLength(2);
    expect(observe).toHaveBeenCalled();

    fireEvent.mouseEnter(overflow);
    await waitFor(() => expect(tree.getByTestId('metric-overflow-popover')).toBeInTheDocument());
    expect(tree.getByTestId('metric-overflow-popover')).toHaveTextContent('pill-3');
    expect(tree.getByTestId('metric-overflow-popover')).toHaveTextContent('pill-4');

    // Moving from the chip into the popover keeps it open.
    fireEvent.mouseLeave(overflow);
    fireEvent.mouseEnter(tree.getByTestId('metric-overflow-popover'));
    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
    expect(tree.getByTestId('metric-overflow-popover')).toBeInTheDocument();

    fireEvent.mouseLeave(tree.getByTestId('metric-overflow-popover'));
    await waitFor(() =>
      expect(tree.queryByTestId('metric-overflow-popover')).not.toBeInTheDocument(),
    );

    tree.unmount();
    expect(disconnect).toHaveBeenCalled();
    restoreLayout();
  });

  it('opens from click and closes on scroll or resize', async () => {
    const restoreLayout = mockOverflowLayout();
    const tree = render(<MetricPills pills={pills} />);
    const overflow = tree.getByTestId('metric-overflow');

    fireEvent.click(overflow);
    await waitFor(() => expect(tree.getByTestId('metric-overflow-popover')).toBeInTheDocument());

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    await waitFor(() =>
      expect(tree.queryByTestId('metric-overflow-popover')).not.toBeInTheDocument(),
    );

    fireEvent.click(overflow);
    await waitFor(() => expect(tree.getByTestId('metric-overflow-popover')).toBeInTheDocument());

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    await waitFor(() =>
      expect(tree.queryByTestId('metric-overflow-popover')).not.toBeInTheDocument(),
    );

    restoreLayout();
  });

  describe('getVisibleCount', () => {
    it('keeps every pill when the total fits', () => {
      expect(getVisibleCount([10, 10], 100, 20)).toBe(2);
    });

    it('reserves room for the catch-all when pills overflow', () => {
      expect(getVisibleCount([40, 40, 40, 40, 40], 200, 40)).toBe(3);
    });

    it('returns no inline pills when even one cannot fit beside the chip', () => {
      expect(getVisibleCount([100], 50, 20)).toBe(0);
    });
  });
});
