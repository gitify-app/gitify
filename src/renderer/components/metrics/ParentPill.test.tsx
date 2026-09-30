import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import type { GitifyParentIssue, Link } from '../../types';

import * as comms from '../../utils/system/comms';
import { ParentPill, type ParentPillProps } from './ParentPill';

describe('renderer/components/metrics/ParentPill.tsx', () => {
  const mockParent: GitifyParentIssue = {
    number: 123,
    title: 'Epic Title',
    url: 'https://github.com/gitify-app/notifications-test/issues/123' as Link,
  };

  it('renders nothing when parent is undefined or null', () => {
    const { container } = renderWithProviders(<ParentPill parent={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders parent pill with issue number and title', () => {
    const props: ParentPillProps = {
      parent: mockParent,
    };

    const tree = renderWithProviders(<ParentPill {...props} />);

    expect(screen.getByText('#123 Epic Title')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Parent issue: #123 Epic Title' }),
    ).toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('opens parent issue url on click and stops propagation', () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());
    const onParentClick = vi.fn();

    renderWithProviders(
      <div onClick={onParentClick}>
        <ParentPill parent={mockParent} />
      </div>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(openExternalLinkSpy).toHaveBeenCalledWith(mockParent.url);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('opens the parent with the keyboard without activating the notification row', async () => {
    const user = userEvent.setup();
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());
    const onRowClick = vi.fn();

    renderWithProviders(
      <div onClick={onRowClick}>
        <ParentPill parent={mockParent} />
      </div>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Parent issue: #123 Epic Title' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(openExternalLinkSpy).toHaveBeenCalledWith(mockParent.url);
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
