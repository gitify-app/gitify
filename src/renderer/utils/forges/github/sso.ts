import type { OrganizationAuthorizationCondition } from '../../notifications/orgAuthorization';

/**
 * Parse an `X-GitHub-SSO` header value.
 *
 * The header is driven by its value, never by the response status: GitHub sends
 * `partial-results` on a `200` whose body is silently incomplete, and
 * `required` on either a `403` or a `200` carrying partial data plus errors.
 *
 * A value this version does not recognise is reported as `unknown` rather than
 * folded into "no condition" — a header GitHub sent that we failed to parse is
 * still a header GitHub sent.
 *
 * @param value - The raw header value, or the absence of the header.
 * @returns The condition, or `null` when the header is absent or blank.
 */
export function parseSsoHeader(
  value: string | null | undefined,
): OrganizationAuthorizationCondition | null {
  const raw = value?.trim();
  if (!raw) {
    return null;
  }

  const [directive, ...parameters] = raw
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);

  let url: string | null = null;
  let organizationIds: string[] = [];

  for (const parameter of parameters) {
    const separatorAt = parameter.indexOf('=');
    if (separatorAt < 0) {
      continue;
    }

    const name = parameter.slice(0, separatorAt).trim().toLowerCase();
    const parameterValue = parameter.slice(separatorAt + 1).trim();

    if (name === 'organizations') {
      organizationIds = parameterValue
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    } else if (name === 'url') {
      url = parameterValue || null;
    }
  }

  switch (directive?.toLowerCase()) {
    case 'partial-results':
      return { kind: 'partial-results', organizationIds };
    case 'required':
      return { kind: 'required', url };
    default:
      return { kind: 'unknown', raw };
  }
}

/**
 * Extract the organization login from an authorizing link, when the link is
 * organization-scoped (`/orgs/<login>/sso`). Enterprise-scoped links
 * (`/enterprises/<slug>/sso`) name no organization, so this returns `null`.
 *
 * @param url - The authorizing link from a `required` condition.
 * @returns The organization login, or `null` when the link names no organization.
 */
export function organizationLoginFromSsoUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    const { pathname } = new URL(url);
    const match = /^\/orgs\/([^/]+)\/sso\/?$/.exec(pathname);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}
