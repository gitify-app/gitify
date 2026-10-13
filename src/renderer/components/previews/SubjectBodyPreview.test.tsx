import { screen } from '@testing-library/react';

import { IssueOpenedIcon } from '@primer/octicons-react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { IconColor } from '../../types';

import { SubjectBodyPreview } from './SubjectBodyPreview';

describe('renderer/components/previews/SubjectBodyPreview.tsx', () => {
  it('renders a GitHub-style header with the type, number, and title', () => {
    renderWithProviders(
      <SubjectBodyPreview
        bodyHtml="<p>Body</p>"
        icon={IssueOpenedIcon}
        iconColor={IconColor.GREEN}
        number="#123"
        title="An issue"
        typeLabel="Open Issue"
      />,
    );

    expect(screen.getByText('Open Issue')).toBeInTheDocument();
    expect(screen.getByText('#123')).toBeInTheDocument();
    expect(screen.getByText('An issue')).toBeInTheDocument();
  });

  it('renders the body with formatting preserved', () => {
    const tree = renderWithProviders(
      <SubjectBodyPreview bodyHtml="<h3>Title</h3><p>Hello <strong>world</strong></p><ul><li>One</li></ul>" />,
    );

    const body = screen.getByTestId('subject-body-preview');
    expect(body).toHaveClass('markdown-body');
    expect(body.querySelector('h3')).toHaveTextContent('Title');
    expect(body.querySelector('strong')).toHaveTextContent('world');
    expect(body.querySelector('li')).toHaveTextContent('One');
    expect(tree.container).toMatchSnapshot();
  });

  it('sanitises unsafe markup', () => {
    renderWithProviders(
      <SubjectBodyPreview
        bodyHtml={
          '<p>Safe</p><script>alert(1)</script><iframe src="https://example.com"></iframe><img src="https://example.com/a.png" alt="remote" />'
        }
      />,
    );

    const body = screen.getByTestId('subject-body-preview');
    expect(body).toHaveTextContent('Safe');
    expect(body.querySelector('script')).toBeNull();
    expect(body.querySelector('iframe')).toBeNull();
    expect(body.querySelector('img')).toBeNull();
  });
});
