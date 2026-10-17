import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import {
  AlertFillIcon,
  CheckCircleFillIcon,
  DashIcon,
  LinkExternalIcon,
  OrganizationIcon,
  XCircleFillIcon,
} from '@primer/octicons-react';
import { Button, Spinner, Stack, Text } from '@primer/react';

import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';

import type { Account } from '../types';
import type { OrganizationAccessReport, OrganizationAccessState } from '../utils/forges/types';

import { getAccountAdapter } from '../utils/forges/registry';
import { getOrganizationAuthorization } from '../utils/notifications/orgAuthorization';
import { openAccountSettings, openOrganizationAuthorization } from '../utils/system/links';

interface LocationState {
  account: Account;
}

const STATE_LABELS: Record<OrganizationAccessState, string> = {
  granted: 'Access granted',
  'authorization-required': 'Authorization required',
  'membership-pending': 'Membership approval pending',
  'app-access-blocked': 'App access blocked',
  unknown: 'Unable to determine',
};

const STATE_DESCRIPTIONS: Record<OrganizationAccessState, string> = {
  granted: 'Gitify can read this organization.',
  'authorization-required':
    'Authorize your credentials for this organization to receive its notifications.',
  'membership-pending':
    'Your membership has not been approved yet, so its notifications are hidden.',
  'app-access-blocked':
    'This organization restricts third-party apps. An owner must approve access.',
  unknown: 'Gitify could not determine this organization’s access.',
};

function OrganizationStateIcon({ state }: Readonly<{ state: OrganizationAccessState }>) {
  const testId = `account-orgs-state-${state}`;

  switch (state) {
    case 'granted':
      return <CheckCircleFillIcon className="text-gitify-success" data-testid={testId} size={14} />;
    case 'app-access-blocked':
      return <XCircleFillIcon className="text-gitify-danger" data-testid={testId} size={14} />;
    case 'authorization-required':
    case 'membership-pending':
      return <AlertFillIcon className="text-gitify-warning" data-testid={testId} size={14} />;
    default:
      return <DashIcon className="opacity-30" data-testid={testId} size={14} />;
  }
}

export function AccountOrgsRoute() {
  const location = useLocation();
  const { account } = location.state as LocationState;

  // `getAccountAdapter` builds a fresh view per call, so it is memoised on the
  // account identity; otherwise the effect below would re-run every render.
  const fetchOrganizationAccess = useMemo(() => {
    const orgAuthorization = getAccountAdapter(account).orgAuthorization;

    return orgAuthorization ? () => orgAuthorization.fetchOrganizationAccess() : undefined;
  }, [account]);

  const [report, setReport] = useState<OrganizationAccessReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const result = fetchOrganizationAccess
          ? await fetchOrganizationAccess()
          : ({ outcome: 'undetermined' } as const);

        if (!cancelled) {
          setReport(result);
        }
      } catch {
        if (!cancelled) {
          setReport({ outcome: 'undetermined' });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetchOrganizationAccess, reloadToken]);

  const retry = () => {
    setIsLoading(true);
    setReloadToken((token) => token + 1);
  };

  // The condition is read from the signal registry, which the listing above
  // refreshes, so only a current link is ever offered.
  const condition = getOrganizationAuthorization(account).condition;
  const authorizationUrl = condition?.kind === 'required' ? condition.url : null;

  const organizations = report?.outcome === 'determined' ? report.organizations : [];
  const allGranted =
    report?.outcome === 'determined' &&
    organizations.length > 0 &&
    organizations.every((organization) => organization.state === 'granted');

  return (
    <Page testId="account-orgs">
      <Header icon={OrganizationIcon}>Organizations</Header>
      <Contents scrollFade>
        <Stack direction="vertical" gap="normal">
          {isLoading && (
            <Stack
              align="center"
              data-testid="account-orgs-loading"
              direction="horizontal"
              gap="condensed"
            >
              <Spinner size="small" />
              <Text className="text-xs opacity-60">Checking organization access…</Text>
            </Stack>
          )}

          {!isLoading && report?.outcome === 'undetermined' && (
            <Stack
              align="center"
              className="rounded-md px-3 py-2 bg-gitify-accounts text-xs"
              data-testid="account-orgs-undetermined"
              direction="horizontal"
              gap="condensed"
            >
              <AlertFillIcon className="text-gitify-warning" size={14} />
              <Text>Could not determine organization access.</Text>
              <Button data-testid="account-orgs-retry" onClick={retry} size="small">
                Retry
              </Button>
            </Stack>
          )}

          {!isLoading && report?.outcome === 'determined' && organizations.length === 0 && (
            <Stack
              align="center"
              className="rounded-md px-3 py-2 bg-gitify-accounts text-xs"
              data-testid="account-orgs-none"
              direction="horizontal"
              gap="condensed"
            >
              <DashIcon className="opacity-30" size={14} />
              <Text>No organizations found for this account.</Text>
            </Stack>
          )}

          {!isLoading &&
            organizations.map((organization, index) => (
              <Stack
                align="center"
                className="gitify-scope-row"
                data-testid="account-orgs-organization"
                direction="horizontal"
                justify="space-between"
                key={`${organization.login ?? 'unnamed'}-${index}`}
                padding="condensed"
              >
                <Stack direction="vertical" gap="none">
                  <Text className="text-xs font-mono">
                    {organization.login ?? 'Unknown organization'}
                  </Text>
                  <Text className="text-xs opacity-60">
                    {STATE_DESCRIPTIONS[organization.state]}
                  </Text>
                </Stack>

                <Stack align="center" direction="horizontal" gap="condensed">
                  <Text className="text-xs opacity-60">{STATE_LABELS[organization.state]}</Text>
                  <OrganizationStateIcon state={organization.state} />
                </Stack>
              </Stack>
            ))}

          {!isLoading && allGranted && (
            <Stack
              align="center"
              data-testid="account-orgs-complete"
              direction="horizontal"
              gap="condensed"
            >
              <CheckCircleFillIcon className="text-gitify-success" size={14} />
              <Text className="text-xs">This account can reach all of its organizations.</Text>
            </Stack>
          )}
        </Stack>
      </Contents>

      <Footer justify="end">
        {authorizationUrl ? (
          <Button
            data-testid="account-orgs-authorize"
            leadingVisual={LinkExternalIcon}
            onClick={() => openOrganizationAuthorization(authorizationUrl)}
          >
            Authorize access
          </Button>
        ) : (
          <Button
            data-testid="account-orgs-manage-link"
            leadingVisual={LinkExternalIcon}
            onClick={() => openAccountSettings(account)}
          >
            Developer settings
          </Button>
        )}
      </Footer>
    </Page>
  );
}
