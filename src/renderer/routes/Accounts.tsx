import { type FC, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AlertFillIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  KeyIcon,
  PersonAddIcon,
  PersonIcon,
  ShieldCheckIcon,
  SignOutIcon,
  StarFillIcon,
  StarIcon,
  SyncIcon,
} from '@primer/octicons-react';
import { ActionList, ActionMenu, Button, IconButton, Stack, Text } from '@primer/react';

import { useLogins } from '../hooks/useLogins';
import { useNotifications } from '../hooks/useNotifications';
import { useAccountsStore } from '../stores';

import { AvatarWithFallback } from '../components/avatars/AvatarWithFallback';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';

import { type Account, type GitifyError, IconColor, Size } from '../types';
import type { ForgeAdapter } from '../utils/forges/types';

import { determineFailureType } from '../utils/api/errors';
import { hasAlternateScopes, hasRecommendedScopes } from '../utils/auth/scopes';
import { getAccountUUID } from '../utils/auth/utils';
import { Errors } from '../utils/core/errors';
import { rendererLogError, toError } from '../utils/core/logger';
import { getAdapter, listAdapters } from '../utils/forges/registry';
import { openAccountProfile, openAccountSettings, openHost } from '../utils/system/links';
import { getPlatformIcon } from '../utils/ui/icons';

export const AccountsRoute: FC = () => {
  const navigate = useNavigate();

  const { logoutFromAccount } = useLogins();
  const { notifications } = useNotifications();

  const accounts = useAccountsStore((s) => s.accounts);
  const refreshAccount = useAccountsStore((s) => s.refreshAccount);

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const [refreshErrorStates, setRefreshErrorStates] = useState<Record<string, GitifyError>>({});

  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [selectedForge, setSelectedForge] = useState<ForgeAdapter | null>(null);
  const keepMenuOpenRef = useRef(false);

  const logoutAccount = useCallback(
    (account: Account) => {
      logoutFromAccount(account);
    },
    [logoutFromAccount],
  );

  const setAsPrimaryAccount = (account: Account) => {
    useAccountsStore.setState({
      accounts: [account, ...accounts.filter((a) => a !== account)],
    });
    navigate('/accounts', { replace: true });
  };

  const handleRefresh = async (account: Account) => {
    const accountUUID = getAccountUUID(account);

    setLoadingStates((prev) => ({ ...prev, [accountUUID]: true }));
    setRefreshErrorStates((prev) => {
      const next = { ...prev };
      delete next[accountUUID];
      return next;
    });

    try {
      await refreshAccount(account);
    } catch (err) {
      setRefreshErrorStates((prev) => ({
        ...prev,
        [accountUUID]: determineFailureType(toError(err)),
      }));
    }

    navigate('/accounts', { replace: true });

    /**
     * Typically the above refresh API call completes very quickly,
     * so we add an brief artificial delay to allow the icon to spin a few times
     */
    setTimeout(() => {
      setLoadingStates((prev) => ({
        ...prev,
        [accountUUID]: false,
      }));
    }, 500);
  };

  const getAccountError = (account: Account) => {
    const accountUUID = getAccountUUID(account);
    return (
      refreshErrorStates[accountUUID] ??
      notifications.find((n) => getAccountUUID(n.account) === accountUUID)?.error ??
      null
    );
  };

  const handleReAuthenticate = (account: Account) => {
    const loginMethod = getAdapter(account).loginMethods.find(
      (method) => method.authMethod === account.method,
    );

    if (!loginMethod) {
      rendererLogError(
        'handleReAuthenticate',
        `no login method registered for forge ${account.forge} and auth method ${account.method}`,
        new Error('Unable to re-authenticate account'),
      );
      return;
    }

    navigate(loginMethod.route, {
      replace: true,
      state: { account },
    });
  };

  return (
    <Page testId="accounts">
      <Header icon={PersonIcon}>Accounts</Header>

      <Contents>
        {accounts.map((account, i) => {
          const AuthMethodIcon = getAdapter(account).getAuthMethodIcon(account.method);
          const PlatformIcon = getPlatformIcon(account.platform);
          const accountUUID = getAccountUUID(account);
          const accountError = getAccountError(account);
          const hasBadCredentials = accountError === Errors.BAD_CREDENTIALS;

          return (
            <div className="rounded-md p-2 mb-4 bg-gitify-accounts" key={accountUUID}>
              <Stack align="stretch" direction="vertical">
                <Stack align="start" direction="horizontal">
                  <Button
                    data-testid="account-profile"
                    onClick={() => openAccountProfile(account)}
                    title="Open account profile ↗"
                  >
                    <AvatarWithFallback
                      alt={account.user?.login}
                      name={`@${account.user?.login}`}
                      size={Size.XLARGE}
                      src={account.user?.avatar ?? undefined}
                    />
                  </Button>
                </Stack>

                <Stack align="start" direction="horizontal" justify="space-between">
                  <div className="pl-2 pb-2 text-xs">
                    <Stack direction="vertical" gap="condensed">
                      <Stack
                        align="center"
                        direction="horizontal"
                        gap="condensed"
                        hidden={!account.user?.name}
                      >
                        <PersonIcon />
                        <Text>{account.user?.name}</Text>
                      </Stack>

                      <Stack
                        align="center"
                        className="cursor-pointer"
                        data-testid="account-host"
                        direction="horizontal"
                        gap="condensed"
                        onClick={() => openHost(account.hostname)}
                        title="Open host ↗"
                      >
                        {PlatformIcon && <PlatformIcon />}
                        <Text>{account.hostname}</Text>
                      </Stack>

                      <Stack
                        align="center"
                        className="cursor-pointer"
                        data-testid="account-developer-settings"
                        direction="horizontal"
                        gap="condensed"
                        onClick={() => openAccountSettings(account)}
                        title="Open developer settings ↗"
                      >
                        {AuthMethodIcon && <AuthMethodIcon />}
                        <Text>{account.method}</Text>
                      </Stack>

                      {hasBadCredentials && (
                        <Stack
                          align="center"
                          className="cursor-pointer text-gitify-danger"
                          data-testid="account-bad-credentials"
                          direction="horizontal"
                          gap="condensed"
                          onClick={() => openAccountSettings(account)}
                          title="Open developer settings ↗"
                        >
                          <AlertFillIcon />
                          <Text>Invalid or expired credentials</Text>
                        </Stack>
                      )}
                    </Stack>
                  </div>

                  <Stack direction="horizontal" gap="condensed">
                    <IconButton
                      aria-label={`Set as primary account (${i === 0 ? 'current primary' : 'click to set'})`}
                      data-testid="account-set-primary"
                      icon={i === 0 ? StarFillIcon : StarIcon}
                      onClick={() => setAsPrimaryAccount(account)}
                      size="small"
                      variant={i === 0 ? 'primary' : 'default'}
                    />

                    {!hasBadCredentials && getAdapter(account).oauthScopes && (
                      <IconButton
                        aria-label={`View scopes for ${account.user?.login}`}
                        data-testid="account-view-scopes"
                        icon={() => (
                          <ShieldCheckIcon
                            className={
                              hasRecommendedScopes(account)
                                ? IconColor.GREEN
                                : hasAlternateScopes(account)
                                  ? 'text-gitify-warning'
                                  : ''
                            }
                          />
                        )}
                        onClick={() =>
                          navigate('/account-scopes', {
                            state: { account },
                          })
                        }
                        size="small"
                        variant={
                          !hasRecommendedScopes(account) && !hasAlternateScopes(account)
                            ? 'danger'
                            : 'default'
                        }
                      />
                    )}

                    {hasBadCredentials && (
                      <IconButton
                        aria-label={`Re-authenticate ${account.user?.login}`}
                        data-testid="account-reauthenticate"
                        icon={KeyIcon}
                        onClick={() => handleReAuthenticate(account)}
                        size="small"
                        variant="danger"
                      />
                    )}

                    <IconButton
                      aria-label={`Refresh ${account.user?.login}`}
                      data-testid="account-refresh"
                      icon={SyncIcon}
                      loading={loadingStates[accountUUID] || false}
                      onClick={() => handleRefresh(account)}
                      size="small"
                    />

                    <IconButton
                      aria-label={`Logout ${account.user?.login}`}
                      data-testid="account-logout"
                      icon={SignOutIcon}
                      onClick={() => logoutAccount(account)}
                      size="small"
                      variant="danger"
                    />
                  </Stack>
                </Stack>
              </Stack>
            </div>
          );
        })}
      </Contents>

      <Footer justify="end">
        <ActionMenu
          open={addMenuOpen}
          onOpenChange={(open) => {
            if (!open && keepMenuOpenRef.current) {
              keepMenuOpenRef.current = false;
              return;
            }
            setAddMenuOpen(open);
            if (!open) {setSelectedForge(null);}
          }}
        >
          <ActionMenu.Anchor>
            <Button data-testid="account-add-new" leadingVisual={PersonAddIcon}>
              Add new account
            </Button>
          </ActionMenu.Anchor>

          <ActionMenu.Overlay width="medium">
            {selectedForge ? (
              <ActionList>
                <ActionList.Item
                  onSelect={() => {
                    keepMenuOpenRef.current = true;
                    setSelectedForge(null);
                  }}
                >
                  <ActionList.LeadingVisual>
                    <ArrowLeftIcon />
                  </ActionList.LeadingVisual>
                  Back
                </ActionList.Item>

                <ActionList.Divider />

                <ActionList.Group>
                  <ActionList.GroupHeading>
                    <Stack align="center" direction="horizontal" gap="condensed">
                      <selectedForge.icon size={12} />
                      {selectedForge.displayName}
                    </Stack>
                  </ActionList.GroupHeading>

                  {selectedForge.loginMethods.map((method) => {
                    const MethodIcon = method.icon;
                    return (
                      <ActionList.Item
                        data-testid={`account-add-${method.testId.replace(/^login-/, '')}`}
                        key={method.testId}
                        onSelect={() => navigate(method.route, { replace: true })}
                      >
                        <ActionList.LeadingVisual>
                          <MethodIcon />
                        </ActionList.LeadingVisual>
                        {method.label}
                      </ActionList.Item>
                    );
                  })}
                </ActionList.Group>
              </ActionList>
            ) : (
              <ActionList>
                {listAdapters().map((adapter) => {
                  const ForgeIcon = adapter.icon;
                  const hasMultipleMethods = adapter.loginMethods.length > 1;

                  return (
                    <ActionList.Item
                      data-testid={`account-add-forge-${adapter.id}`}
                      key={adapter.id}
                      onSelect={() => {
                        if (hasMultipleMethods) {
                          keepMenuOpenRef.current = true;
                          setSelectedForge(adapter);
                        } else {
                          navigate(adapter.loginMethods[0].route, { replace: true });
                        }
                      }}
                    >
                      <ActionList.LeadingVisual>
                        <ForgeIcon />
                      </ActionList.LeadingVisual>
                      <Stack direction="vertical" gap="none">
                        <span>{adapter.displayName}</span>
                        <Text className="text-xs">{adapter.tagline}</Text>
                      </Stack>
                      {hasMultipleMethods && (
                        <ActionList.TrailingVisual>
                          <ChevronRightIcon />
                        </ActionList.TrailingVisual>
                      )}
                    </ActionList.Item>
                  );
                })}
              </ActionList>
            )}
          </ActionMenu.Overlay>
        </ActionMenu>
      </Footer>
    </Page>
  );
};
