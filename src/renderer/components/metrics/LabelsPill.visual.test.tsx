import { act, waitFor } from '@testing-library/react';

import { page } from 'vite-plus/test/browser';

import { renderRoute } from '../../__helpers__/visual-utils';

import { DesignLanguage, Theme } from '../../types';

import { LabelsPill } from './LabelsPill';

function textContrast(element: HTMLElement): number {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) {
    throw new Error('Canvas context is unavailable');
  }
  const ancestors: Element[] = [];
  for (let current: Element | null = element; current; current = current.parentElement) {
    ancestors.unshift(current);
  }
  context.fillStyle = 'white';
  context.fillRect(0, 0, 1, 1);
  for (const ancestor of ancestors) {
    context.fillStyle = getComputedStyle(ancestor).backgroundColor;
    context.fillRect(0, 0, 1, 1);
  }
  const background = context.getImageData(0, 0, 1, 1).data;
  context.fillStyle = getComputedStyle(element).color;
  context.fillRect(0, 0, 1, 1);
  const foreground = context.getImageData(0, 0, 1, 1).data;
  const luminance = (color: Uint8ClampedArray) => {
    const channels = Array.from(color)
      .slice(0, 3)
      .map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

it.each([
  [DesignLanguage.GLASS, Theme.DARK],
  [DesignLanguage.GLASS, Theme.DARK_DIMMED],
  [DesignLanguage.GLASS, Theme.LIGHT],
  [DesignLanguage.GLASS, Theme.SYSTEM],
  [DesignLanguage.CLASSIC, Theme.DARK],
  [DesignLanguage.CLASSIC, Theme.LIGHT],
])('keeps label text readable in %s %s tooltips', async (designLanguage, theme) => {
  const tree = await renderRoute(
    <div data-testid="label-metric" style={{ padding: 60 }}>
      <LabelsPill labels={[{ name: 'enhancement', color: '0e8a16' }]} />
    </div>,
    { theme, designLanguage },
  );
  await act(async () => {
    await page.getByTestId('label-metric').getByRole('button').hover();
  });
  const label = tree.getByText('enhancement');
  const tooltip = label.closest('[role="tooltip"]');
  if (!tooltip) {
    throw new Error('Label tooltip is missing');
  }
  await waitFor(() => expect(tooltip).toBeVisible());
  expect(textContrast(label)).toBeGreaterThanOrEqual(4.5);
  await act(async () => {
    await page.getByTestId('label-metric').hover({ position: { x: 1, y: 1 } });
  });
  await waitFor(() => expect(tooltip).not.toBeVisible());
});
