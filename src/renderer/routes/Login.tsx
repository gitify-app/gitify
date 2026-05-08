import { type FC, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Heading, Stack, Text } from '@primer/react';

import { useAppContext } from '../hooks/useAppContext';

import { LogoIcon } from '../components/icons/LogoIcon';
import { Centered } from '../components/layout/Centered';

import { type Forge, Size } from '../types';
import type {
  ForgeAdapter,
  LoginMethodDescriptor,
} from '../utils/forges/types';

import { listAdapters } from '../utils/forges/registry';
import { showWindow } from '../utils/system/comms';
import { cn } from '../utils/ui/cn';

/**
 * Pick the method that should drive the dominant CTA for a forge.
 * Falls back to the first registered method when no `primary` variant exists.
 */
function pickPrimaryMethod(
  adapter: ForgeAdapter,
): LoginMethodDescriptor | undefined {
  return (
    adapter.loginMethods.find((m) => m.variant === 'primary') ??
    adapter.loginMethods[0]
  );
}

export const LoginRoute: FC = () => {
  const navigate = useNavigate();
  const adapters = listAdapters();

  const { isLoggedIn } = useAppContext();

  const [activeForge, setActiveForge] = useState<Forge>(adapters[0].id);
  const activeAdapter = useMemo(
    () => adapters.find((a) => a.id === activeForge) ?? adapters[0],
    [activeForge, adapters],
  );

  useEffect(() => {
    if (isLoggedIn) {
      showWindow();
      navigate('/', { replace: true });
    }
  }, [isLoggedIn]);

  const goTo = (method: LoginMethodDescriptor) => {
    if (method.state) {
      navigate(method.route, { state: method.state });
    } else {
      navigate(method.route);
    }
  };

  const primary = pickPrimaryMethod(activeAdapter);
  const alternates = activeAdapter.loginMethods.filter((m) => m !== primary);

  return (
    <Centered fullHeight={true}>
      <div aria-hidden="true" className="gitify-login-halo" />

      <Stack align="center" direction="vertical" gap="condensed">
        <div className="gitify-login-fade" style={{ animationDelay: '0ms' }}>
          <LogoIcon isDark size={Size.LARGE} />
        </div>

        <Stack
          align="center"
          className="gitify-login-fade"
          gap="none"
          style={{ animationDelay: '60ms' }}
        >
          <Heading as="h2">Notifications</Heading>
          <Heading as="h3">on your menu bar</Heading>
        </Stack>

        {adapters.length > 1 && (
          <div
            aria-label="Choose a forge"
            className={cn(
              'gitify-login-fade',
              'inline-flex items-center gap-1 rounded-full',
              'border border-[var(--borderColor-default)]',
              'bg-[var(--bgColor-muted)] p-1',
            )}
            data-testid="forge-tablist"
            role="tablist"
            style={{ animationDelay: '120ms' }}
          >
            {adapters.map((adapter) => {
              const Icon = adapter.icon;
              const isActive = adapter.id === activeForge;
              return (
                <button
                  aria-controls={`forge-panel-${adapter.id}`}
                  aria-selected={isActive}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-2',
                    'px-3 py-1.5 text-sm font-medium transition-colors',
                    'outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-outlineColor)]',
                    isActive
                      ? 'bg-[var(--bgColor-default)] text-[var(--fgColor-default)] shadow-sm'
                      : 'text-[var(--fgColor-muted)] hover:text-[var(--fgColor-default)]',
                  )}
                  data-testid={`forge-tab-${adapter.id}`}
                  key={adapter.id}
                  onClick={() => setActiveForge(adapter.id)}
                  role="tab"
                  style={{ borderRadius: '9999px' }}
                  type="button"
                >
                  <Icon size={14} />
                  {adapter.displayName}
                </button>
              );
            })}
          </div>
        )}

        <div
          aria-labelledby={`forge-tab-${activeAdapter.id}`}
          className="gitify-login-panel w-full max-w-xs"
          id={`forge-panel-${activeAdapter.id}`}
          key={activeAdapter.id}
          role="tabpanel"
        >
          <Stack align="stretch" direction="vertical" gap="condensed">
            {primary && (
              <Button
                block
                data-testid={primary.testId}
                leadingVisual={primary.icon}
                onClick={() => goTo(primary)}
                variant="primary"
              >
                Continue with {activeAdapter.displayName}
              </Button>
            )}

            {alternates.map((method) => (
              <Button
                block
                data-testid={method.testId}
                key={method.testId}
                leadingVisual={method.icon}
                onClick={() => goTo(method)}
                variant={method.variant ?? 'invisible'}
              >
                {method.label}
              </Button>
            ))}

            {activeAdapter.tagline && (
              <Text
                as="p"
                className="pt-1 text-center text-[var(--fgColor-muted)] text-xxs"
                size="small"
              >
                {activeAdapter.tagline}
              </Text>
            )}
          </Stack>
        </div>
      </Stack>
    </Centered>
  );
};
