import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button, Heading, Stack, Text } from '@primer/react';

import { cn } from 'cn';

import { useAccountsStore } from '../stores';

import { type Forge, Size } from '../types';
import type { ForgeAdapter, LoginMethodDescriptor } from '../utils/forges/types';

import { LogoIcon } from '../icons/LogoIcon';
import {
  compactLoginMethodLabel,
  translateForgeTagline,
  translateLoginMethodLabel,
} from '../utils/forges/labels';
import { listAdapters } from '../utils/forges/registry';
import { showWindow } from '../utils/system/comms';

/**
 * Pick the method that should drive the dominant CTA for a forge.
 * Falls back to the first registered method when no `primary` variant exists.
 */
function pickPrimaryMethod(adapter: ForgeAdapter): LoginMethodDescriptor | undefined {
  return adapter.loginMethods.find((m) => m.variant === 'primary') ?? adapter.loginMethods[0];
}

export function LoginRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const adapters = listAdapters();

  const isLoggedIn = useAccountsStore((s) => s.isLoggedIn());

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
  // pill is positioned before paint, and again on resize so zoom changes
  // re-measure the tabs.
  const measurePill = useCallback(() => {
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
      if (prev?.left === next.left && prev?.width === next.width) {
        return prev;
      }
      return next;
    });
  }, [activeForge]);

  useLayoutEffect(() => {
    measurePill();
  }, [measurePill]);

  useEffect(() => {
    window.addEventListener('resize', measurePill);

    return () => window.removeEventListener('resize', measurePill);
  }, [measurePill]);

  useEffect(() => {
    if (isLoggedIn) {
      showWindow();
      void navigate('/', { replace: true });
    }
    // oxlint-disable-next-line react/exhaustive-deps -- navigate is stable
  }, [isLoggedIn]);

  const primary = pickPrimaryMethod(activeAdapter);
  const alternates = activeAdapter.loginMethods.filter((m) => m !== primary);

  return (
    <div className="flex h-screen w-full overflow-y-auto pt-6">
      <Stack align="center" className="m-auto w-full px-4" direction="vertical" gap="condensed">
        <div
          className="motion-reduce:animate-none animate-login-fade-up"
          data-testid="login-logo"
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
          <Heading as="h2">{t('login.title', 'Git Notifications')}</Heading>
          <Heading as="h3">{t('login.subtitle', 'on your menu bar')}</Heading>
        </Stack>

        {adapters.length > 1 && (
          <div
            aria-label={t('login.choose_forge', 'Choose a forge')}
            className={cn(
              'motion-reduce:animate-none animate-login-fade-up',
              'relative inline-flex max-w-full items-center rounded-full',
              'border border-[var(--borderColor-default)]',
              'bg-[var(--bgColor-muted)] p-1',
            )}
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
                    'px-2.5 py-1.5 text-sm font-medium transition-colors',
                    'max-[30rem]:px-2 max-[30rem]:text-xs',
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
          className="motion-reduce:animate-none animate-login-panel-fade flex min-h-[9rem] w-full max-w-sm flex-col"
          id={`forge-panel-${activeAdapter.id}`}
          key={activeAdapter.id}
          role="tabpanel"
        >
          <Stack align="stretch" className="flex-1" direction="vertical" gap="condensed">
            {primary && (
              <Button
                block
                data-testid={primary.testId}
                leadingVisual={primary.icon}
                onClick={() => navigate(primary.route)}
                variant="primary"
              >
                {t('login.continue_with', 'Continue with {{name}}', {
                  name: activeAdapter.displayName,
                })}
              </Button>
            )}

            {alternates.length > 0 && (
              <div className="flex flex-col gap-2">
                <div aria-hidden="true" className="flex items-center gap-2">
                  <span className="h-px flex-1 bg-[var(--borderColor-default)]" />
                  <span className="text-[var(--fgColor-muted)] text-xxs">
                    {t('login.or', 'or')}
                  </span>
                  <span className="h-px flex-1 bg-[var(--borderColor-default)]" />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {alternates.map((method) => (
                    <Button
                      aria-label={translateLoginMethodLabel(method.label)}
                      data-testid={method.testId}
                      key={method.testId}
                      leadingVisual={method.icon}
                      onClick={() => navigate(method.route)}
                      size="small"
                      title={translateLoginMethodLabel(method.label)}
                      variant="default"
                    >
                      {compactLoginMethodLabel(method.label)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {activeAdapter.tagline && (
              <Text
                as="p"
                className="mt-auto pt-1 text-center text-[var(--fgColor-muted)] text-xxs"
                size="small"
              >
                {translateForgeTagline(activeAdapter.tagline)}
              </Text>
            )}
          </Stack>
        </div>
      </Stack>
    </div>
  );
}
