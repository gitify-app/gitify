import { renderWithProviders } from '../../__helpers__/test-utils';

import { HoverGroup } from './HoverGroup';

describe('renderer/components/primitives/HoverGroup.tsx', () => {
  it('renders', () => {
    const tree = renderWithProviders(
      <HoverGroup bgColor="group-hover:bg-gitify-repository">Hover Group</HoverGroup>,
    );
    expect(tree.container).toMatchSnapshot();
  });

  it('spans the host height', () => {
    const tree = renderWithProviders(
      <HoverGroup bgColor="group-hover:bg-gitify-notification-hover">Hover Group</HoverGroup>,
    );

    const cluster = tree.container.querySelector('.gitify-hover-actions');

    expect(cluster).toBeInTheDocument();
    // Full-height rail so the buttons form a consistent hit zone.
    expect(cluster).toHaveClass('inset-y-0');
  });

  it('stretches its buttons only when fullHeight is set', () => {
    const tree = renderWithProviders(
      <HoverGroup bgColor="group-hover:bg-gitify-notification-hover" fullHeight>
        Hover Group
      </HoverGroup>,
    );

    const cluster = tree.container.querySelector('.gitify-hover-actions');

    expect(cluster).toHaveClass('gitify-hover-actions-full');
  });

  it('does not stretch its buttons by default', () => {
    const tree = renderWithProviders(
      <HoverGroup bgColor="group-hover:bg-gitify-repository">Hover Group</HoverGroup>,
    );

    const cluster = tree.container.querySelector('.gitify-hover-actions');

    expect(cluster).not.toHaveClass('gitify-hover-actions-full');
  });
});
