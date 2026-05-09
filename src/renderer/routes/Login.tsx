import { type FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Heading, Stack, Text } from '@primer/react';

import { useAppContext } from '../hooks/useAppContext';

import { LogoIcon } from '../components/icons/LogoIcon';
import { Centered } from '../components/layout/Centered';

import { type Forge, Size } from '../types';
import type { ForgeAdapter, LoginMethodDescriptor } from '../utils/forges/types';

import { listAdapters } from '../utils/forges/registry';
import { showWindow } from '../utils/system/comms';
import { cn } from '../utils/ui/cn';

/**
 * Pick the method that should drive the dominant CTA for a forge.
 * Falls back to the first registered method when no `primary` variant exists.
 */
function pickPrimaryMethod(adapter: ForgeAdapter): LoginMethodDescriptor | undefined {
  return adapter.loginMethods.find((m) => m.variant === 'primary') ?? adapter.loginMethods[0];
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

  const tablistRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef(new Map<Forge, HTMLButtonElement>());
  const [pillRect, setPillRect] = useState<{
    left: number;
    width: number;
  } | null>(null);

  // Measure the active tab so the indicator pill can slide between tabs
  // instead of snapping bg colors. Runs synchronously after layout so the
  // pill is positioned before paint.
  useLayoutEffect(() => {
    const tablist = tablistRef.current;
    const active = tabRefs.current.get(activeForge);
    if (!tablist || !active) {
      return;
    }
    const parentRect = tablist.getBoundingClientRect();
    const btnRect = active.getBoundingClientRect();
    setPillRect((prev) => {
      const next = {
        left: btnRect.left - parentRect.left,
        width: btnRect.width,
      };
      // Avoid setState->layout->setState loops when nothing changed.
      if (prev && prev.left === next.left && prev.width === next.width) {
        return prev;
      }
      return next;
    });
  }, [activeForge]);

  useEffect(() => {
    if (isLoggedIn) {
      showWindow();
      navigate('/', { replace: true });
    }
    // oxlint-disable-next-line react/exhaustive-deps -- navigate is stable
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
      <Stack align="center" direction="vertical" gap="condensed">
        <div
          className="motion-reduce:animate-none animate-login-fade-up"
          style={{ animationDelay: '0ms' }}
        >
          <LogoIcon isDark size={Size.LARGE} />
        </div>

        <Stack
          align="center"
          className="motion-reduce:animate-none animate-login-fade-up"
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
              'motion-reduce:animate-none animate-login-fade-up',
              'relative inline-flex items-center rounded-full',
              'border border-[var(--borderColor-default)]',
              'bg-[var(--bgColor-muted)] p-1',
            )}
            data-testid="forge-tablist"
            ref={tablistRef}
            role="tablist"
            style={{ animationDelay: '120ms' }}
          >
            {pillRect && (
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute top-1 bottom-1 rounded-full',
                  'bg-[var(--bgColor-default)] shadow-sm',
                  'transition-[left,width] duration-300 ease-login-out',
                  'motion-reduce:transition-none',
                )}
                data-testid="forge-tab-indicator"
                style={{ left: pillRect.left, width: pillRect.width }}
              />
            )}
            {adapters.map((adapter) => {
              const Icon = adapter.icon;
              const isActive = adapter.id === activeForge;
              return (
                <button
                  aria-controls={`forge-panel-${adapter.id}`}
                  aria-selected={isActive}
                  className={cn(
                    'relative z-10 inline-flex cursor-pointer items-center gap-2',
                    'px-3 py-1.5 text-sm font-medium transition-colors',
                    'outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-outlineColor)]',
                    isActive
                      ? 'text-[var(--fgColor-default)]'
                      : 'text-[var(--fgColor-muted)] hover:text-[var(--fgColor-default)]',
                  )}
                  data-testid={`forge-tab-${adapter.id}`}
                  key={adapter.id}
                  onClick={() => setActiveForge(adapter.id)}
                  ref={(el) => {
                    if (el) {
                      tabRefs.current.set(adapter.id, el);
                    } else {
                      tabRefs.current.delete(adapter.id);
                    }
                  }}
                  role="tab"
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
          className="motion-reduce:animate-none animate-login-panel-fade w-full max-w-xs"
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
