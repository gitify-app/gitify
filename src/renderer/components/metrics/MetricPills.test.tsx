import { act, fireEvent, render, waitFor } from '@testing-library/react';

import { getVisibleCount, MetricPills } from './MetricPills';

const pills = Array.from({ length: 5 }, (_, index) => <span key={index}>pill-{index}</span>);

function mockOverflowLayout({
  pillWidth = () => 40,
  chipWidth = () => 40,
}: {
  pillWidth?: (element: HTMLElement) => number;
  chipWidth?: (count: number) => number;
} = {}) {
  const clientWidth = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);
  const rect = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      const inStrip = this.closest('[data-testid="metric-pills"]') !== null;
      const chip = this.querySelector('[data-testid="metric-overflow"]');
      let width = inStrip ? pillWidth(this) : 0;

      if (this.matches('[data-testid="metric-overflow-measure"]')) {
        // The max-content grid overlaps the candidate chips in one cell.
        width = Math.max(
          0,
          ...Array.from(this.children, (child) => chipWidth(Number(child.textContent))),
        );
      } else if (chip) {
        width = chipWidth(Number(chip.textContent));
      }

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

function mockResizeObserver() {
  let onResize: ResizeObserverCallback;
  const observe = vi.fn();
  const disconnect = vi.fn();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        onResize = callback;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );

  return {
    observe,
    disconnect,
    resize: () => act(() => onResize([], {} as ResizeObserver)),
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
    expect(tree.getByText('pill-2').parentElement).not.toHaveAttribute('aria-hidden');
    for (const text of ['pill-3', 'pill-4']) {
      expect(tree.getByText(text).parentElement).toHaveAttribute('aria-hidden', 'true');
      expect(tree.getByText(text).parentElement).toHaveAttribute('inert');
    }
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

  it('settles with proportional chip digits in a fixed-width container', () => {
    mockOverflowLayout({
      pillWidth: () => 39.5,
      chipWidth: (count) => (count === 4 ? 36.7 : 36.45),
    });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(80);
    const { resize } = mockResizeObserver();

    // With the live chip width, one pill fits beside "5" (79.95px), but not
    // beside "4" (80.2px). The old layout effect alternated forever, throwing
    // maximum update depth exceeded. These widths reproduce the browser case.
    const tree = render(<MetricPills pills={pills} />);

    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('5');
    for (let i = 0; i < 3; i += 1) {
      resize();
      tree.rerender(<MetricPills pills={[...pills]} />);
      expect(tree.getByTestId('metric-overflow')).toHaveTextContent('5');
    }
  });

  it('uses the measured chip width when it is smaller than the old estimate', () => {
    mockOverflowLayout({ pillWidth: () => 34.92, chipWidth: () => 36.7 });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(80);

    const tree = render(<MetricPills pills={pills} />);

    // One pill + gap + chip needs 75.62px. A permanent 44px reserve would hide
    // every pill instead, even though one fits beside the real chip.
    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('4');
    expect(tree.getByText('pill-0').parentElement).not.toHaveAttribute('aria-hidden');
    const measurement = tree.getByTestId('metric-overflow-measure');
    expect(measurement).toHaveAttribute('aria-hidden', 'true');
    expect(measurement).toHaveAttribute('inert');
    expect(tree.getAllByRole('button')).toHaveLength(1);
  });

  it('remeasures when footer content narrows the container and settles on repeat observations', () => {
    mockOverflowLayout();
    // Five 40px pills need 216px inline. Start wide enough for all of them.
    const clientWidth = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(216);
    const { resize } = mockResizeObserver();

    const tree = render(<MetricPills pills={pills} />);
    expect(tree.queryByTestId('metric-overflow')).not.toBeInTheDocument();

    // Relative time text grows (e.g. "9 minutes ago" -> "10 minutes ago")
    // without any notification data change, leaving less room for the pills.
    clientWidth.mockReturnValue(215);
    resize();
    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('2');

    // Repeated observations of the same size keep the same layout.
    for (let i = 0; i < 5; i += 1) {
      resize();
      expect(tree.getByTestId('metric-overflow')).toHaveTextContent('2');
    }
  });

  it('fits a newly mounted wide chip after one resize without parent renders', () => {
    mockOverflowLayout({ chipWidth: () => 80 });
    const clientWidth = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(250);
    const { resize } = mockResizeObserver();
    const tree = render(<MetricPills pills={pills} />);
    expect(tree.queryByTestId('metric-overflow')).not.toBeInTheDocument();

    clientWidth.mockReturnValue(200);
    resize();
    // Three pills + gaps + the real chip need 212px. Only two pills fit, and
    // mounting the chip cannot rely on another container resize notification.
    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('3');
  });

  it('allows the chip reserve to shrink when its measured size changes', () => {
    let chipWidth = 80;
    mockOverflowLayout({ chipWidth: () => chipWidth });
    const { resize } = mockResizeObserver();
    const tree = render(<MetricPills pills={pills} />);
    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('3');

    chipWidth = 40;
    resize();
    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('2');
  });

  it('recomputes the reserve when the widest overflow count is no longer possible', () => {
    mockOverflowLayout({ chipWidth: (count) => (count === 5 ? 80 : 40) });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(170);
    const tree = render(<MetricPills pills={pills} />);
    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('3');

    tree.rerender(<MetricPills pills={pills.slice(0, 4)} />);
    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('2');
  });

  it('refits same-count content changes without rebuilding the container observer', () => {
    mockOverflowLayout({
      pillWidth: (element) => (element.textContent?.includes('wide') ? 60 : 20),
    });
    const { observe, disconnect } = mockResizeObserver();
    const tree = render(<MetricPills pills={pills} />);
    expect(tree.queryByTestId('metric-overflow')).not.toBeInTheDocument();

    tree.rerender(
      <MetricPills
        pills={pills.map((pill) => (
          <span key={pill.key}>wide</span>
        ))}
      />,
    );
    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('3');
    tree.rerender(<MetricPills pills={[...pills]} />);
    expect(tree.queryByTestId('metric-overflow')).not.toBeInTheDocument();
    expect(observe).toHaveBeenCalledExactlyOnceWith(tree.getByTestId('metric-pills'));
    expect(disconnect).not.toHaveBeenCalled();

    tree.unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('remeasures on resize and when the pills change', () => {
    mockOverflowLayout();
    const clientWidth = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);
    const { observe, resize } = mockResizeObserver();

    const tree = render(<MetricPills pills={pills} />);
    expect(tree.getByTestId('metric-overflow')).toHaveTextContent('2');
    // Only the container is observed; it reflects any footer layout change.
    expect(observe).toHaveBeenCalledTimes(1);

    clientWidth.mockReturnValue(250);
    resize();
    expect(tree.queryByTestId('metric-overflow')).not.toBeInTheDocument();

    clientWidth.mockReturnValue(200);
    resize();
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
