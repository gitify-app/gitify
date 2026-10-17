import type { Link } from '../../../../types';

/**
 * Recorded response-header and error fixtures for organization authorization.
 *
 * The header forms and the GraphQL partial-error shape are taken from GitHub's
 * documented behaviour. They exist so parsing and attribution tests never depend
 * on a live account being in an organization that withholds access.
 *
 * @see https://docs.github.com/en/enterprise-cloud@latest/rest/authentication/authenticating-to-the-rest-api
 */

/** Cross-organization listing: `200` whose body silently omits these organizations. */
export const mockSsoPartialResultsHeader =
  'partial-results; organizations=21955855,20582480' as const;

/** Organization-scoped authorization link, carried on a `403` or a partial `200`. */
export const mockSsoRequiredHeader =
  'required; url=https://github.com/orgs/mock-org/sso?authorization_request=abc123' as const;

/** Enterprise-scoped authorization link, which names no organization. */
export const mockSsoEnterpriseRequiredHeader =
  'required; url=https://github.com/enterprises/mock-enterprise/sso?authorization_request=xyz789' as const;

/** A directive Gitify does not recognise; must never be read as "no condition". */
export const mockSsoUnrecognisedHeader = 'some-future-directive; organizations=1' as const;

/** Withheld organization database id, as named by the `partial-results` form. */
export const mockWithheldOrganizationId = '21955855';

/** Withheld organization database id that the token cannot resolve to a login. */
export const mockUnresolvableOrganizationId = '99999999';

export interface MockGraphQLSsoErrorPath {
  alias: string;
}

/**
 * The GraphQL form of a blocked organization: a successful response carrying
 * partial `data` alongside `errors[]` whose `path` names the query alias and
 * whose `extensions` flag the SAML failure.
 *
 * @see https://github.com/cli/cli/issues/5587
 */
export const mockGraphQLSsoPartialResponse = {
  data: {
    n1: {
      issue: {
        number: 123,
      },
    },
    n2: null,
  },
  errors: [
    {
      type: 'FORBIDDEN',
      path: ['n2'],
      extensions: { saml_failure: true },
      message:
        'Resource protected by organization SAML enforcement. You must grant your Personal Access token access to this organization.',
    },
  ],
} satisfies {
  data: Record<string, unknown>;
  errors: Array<{
    type: string;
    path: string[];
    extensions: { saml_failure: boolean };
    message: string;
  }>;
};

/** The authorization link GitHub attaches to the GraphQL partial-error form. */
export const mockGraphQLSsoRequiredUrl = mockSsoRequiredHeader.slice(
  'required; url='.length,
) as Link;
