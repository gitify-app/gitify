import { GitHubDeviceFlowAuthorize } from './DeviceFlowAuthorize';

/**
 * Route element for `/login/github/device-flow`.
 *
 * Authorizes Gitify's preconfigured OAuth app on GitHub.com. A user-supplied
 * custom app uses the `/login/github/custom-oauth-app` route instead, which
 * composes the same `GitHubDeviceFlowAuthorize` UI with its own client ID.
 */
export function GitHubLoginWithDeviceFlowRoute() {
  return <GitHubDeviceFlowAuthorize />;
}
