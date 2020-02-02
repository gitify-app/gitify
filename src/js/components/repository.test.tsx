import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react';

import { mockedGithubNotifications } from '../__mocks__/mockedData';
import { RepositoryNotifications } from './repository';

const { shell } = require('electron');

jest.mock('./notification');

describe('components/repository.tsx', function() {
  const props = {
    hostname: 'github.com',
    repoName: 'manosim/gitify',
    repoNotifications: mockedGithubNotifications,
    markRepoNotifications: jest.fn(),
  };

  beforeEach(() => {
    spyOn(shell, 'openExternal');
  });

  it('should render itself & its children', function() {
    const tree = TestRenderer.create(<RepositoryNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should open the browser when clicking on the repo name', function() {
    const { getByText } = render(<RepositoryNotifications {...props} />);

    fireEvent.click(getByText(props.repoName));

    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith(
      'https://github.com/manosim/notifications-test'
    );
  });

  it('should mark a repo as read', function() {
    const { getByRole, debug } = render(<RepositoryNotifications {...props} />);

    fireEvent.click(getByRole('button'));

    expect(props.markRepoNotifications).toHaveBeenCalledWith(
      'manosim/notifications-test',
      'github.com'
    );
  });
});
