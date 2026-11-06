import { createMemoryRouter } from 'react-router';

import { routes } from './router';

const ROUTE_CASES: Array<[path: string, expectedLeaf: string]> = [
  ['/', 'index'],
  ['/filters', 'filters'],
  ['/settings', 'settings'],
  ['/accounts', 'accounts'],
  ['/account-scopes', 'account-scopes'],
  ['/login', 'login'],
  ['/login/github/device-flow', 'login/github/device-flow'],
  ['/login/github/cli', 'login/github/cli'],
  ['/login/github/personal-access-token', 'login/github/personal-access-token'],
  ['/login/github/custom-oauth-app', 'login/github/custom-oauth-app'],
  ['/login/gitea/personal-access-token', 'login/gitea/personal-access-token'],
  ['/login/bitbucket/personal-access-token', 'login/bitbucket/personal-access-token'],
  ['/login/gitlab/personal-access-token', 'login/gitlab/personal-access-token'],
  ['/unknown', '*'],
];

describe('renderer/router.tsx', () => {
  it.each(ROUTE_CASES)('resolves %s', (path, expectedLeaf) => {
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    const leaf = router.state.matches.at(-1)?.route;

    expect(leaf?.path ?? (leaf?.index ? 'index' : undefined)).toBe(expectedLeaf);
  });
});
