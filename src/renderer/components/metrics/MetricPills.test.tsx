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

  it('does not feed overflow layout changes back into a synchronous render loop', () => {
    mockOverflowLayout();
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      // Simulate the surrounding flex layout allocating different space once
      // the overflow chip replaces the trailing pills.
      return this.querySelector('[data-testid="metric-overflow"]') ? 250 : 200;
    });

    const tree = render(<MetricPills pills={pills} />);

    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('2');
    expect(
      tree.container.querySelectorAll('[data-testid="metric-pills"] > [aria-hidden="true"]'),
    ).toHaveLength(2);
  });

  it('remeasures when footer content narrows the container and settles on repeat observations', () => {
    mockOverflowLayout();
    // Five 40px pills need 216px inline. Start wide enough for all of them.
    const clientWidth = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(216);
    let onResize: ResizeObserverCallback;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          onResize = callback;
        }
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );

    const tree = render(<MetricPills pills={pills} />);
    expect(tree.queryByTestId('metric-overflow')).not.toBeInTheDocument();

    // Relative time text grows (e.g. "9 minutes ago" -> "10 minutes ago")
    // without any notification data change, leaving less room for the pills.
    clientWidth.mockReturnValue(215);
    act(() => onResize([], {} as ResizeObserver));
    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('2');

    // Repeated observations of the same size keep the same layout.
    for (let i = 0; i < 5; i += 1) {
      act(() => onResize([], {} as ResizeObserver));
      expect(tree.getByTestId('metric-overflow')).toHaveTextContent('2');
    }
  });

  it('settles when parent re-renders while the chip is wider than its estimate', () => {
    mockOverflowLayout();
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const isChip = this.querySelector('[data-testid="metric-overflow"]') !== null;
      const inStrip = this.closest('[data-testid="metric-pills"]') !== null;
      const width = isChip ? 80 : inStrip ? 40 : 0;
      return {
        width,
        height: 20,
        top: 0,
        left: 0,
        right: width,
        bottom: 20,
        x: 0,
        y: 0,
      } as DOMRect;
    });

    const tree = render(<MetricPills pills={pills} />);

    // New array identities, as MetricGroup produces on every render.
    for (let i = 0; i < 60; i += 1) {
      tree.rerender(<MetricPills pills={[...pills]} />);
    }

    const counts = new Set<string | null>();
    for (let i = 0; i < 3; i += 1) {
      tree.rerender(<MetricPills pills={[...pills]} />);
      counts.add(tree.queryByTestId('metric-overflow')?.textContent ?? null);
    }
    expect(counts.size).toBe(1);
    // 200px fits 3 x 40px pills beside the 44px estimate but only 2 beside the
    // real 80px chip, so 3 pills overflow once the chip width is known.
    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('3');
  });

  it('remeasures on resize and when the pills change', () => {
    mockOverflowLayout();
    const clientWidth = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);
    let onResize: ResizeObserverCallback;
    const observe = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          onResize = callback;
        }
        observe = observe;
        disconnect = vi.fn();
      },
    );

    const tree = render(<MetricPills pills={pills} />);
    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('2');
    // Only the container is observed; it reflects any footer layout change.
    expect(observe).toHaveBeenCalledTimes(1);

    clientWidth.mockReturnValue(250);
    act(() => onResize([], {} as ResizeObserver));
    expect(tree.queryByTestId('metric-overflow')).not.toBeInTheDocument();

    clientWidth.mockReturnValue(200);
    act(() => onResize([], {} as ResizeObserver));
    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('2');

    tree.rerender(<MetricPills pills={pills.slice(0, 2)} />);
    expect(tree.queryByTestId('metric-overflow')).not.toBeInTheDocument();
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
