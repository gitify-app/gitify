import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Location, useLocation, useNavigate } from 'react-router';

import { Heading, Stack } from '@primer/react';

import { cn } from 'cn';

import { useAccountsStore } from '../stores';

import { LoginPrimaryAction, LoginSecondaryMethods } from '../components/login/LoginMethods';

import { type Forge, Size } from '../types';
import type { ForgeAdapter } from '../utils/forges/types';

import { LogoIcon } from '../icons/LogoIcon';
import { listAdapters } from '../utils/forges/registry';
import { showWindow } from '../utils/system/comms';

/** Keep the outgoing secondary content mounted for exactly as long as its exit animation. */
const PANEL_TRANSITION_MS = 280;

export function LoginRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const adapters = listAdapters();

  const isLoggedIn = useAccountsStore((s) => s.isLoggedIn());

  const [activeForge, setActiveForge] = useState<Forge>(adapters[0].id);
  const [panelDirection, setPanelDirection] = useState<'left' | 'right'>('right');
  const [previousAdapter, setPreviousAdapter] = useState<ForgeAdapter | null>(null);
  const previousTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeAdapter = useMemo(
    () => adapters.find((a) => a.id === activeForge) ?? adapters[0],
    [activeForge, adapters],
  );

  const selectForge = (forge: Forge) => {
    if (forge === activeForge) {
      return;
    }

    const currentIndex = adapters.findIndex((adapter) => adapter.id === activeForge);
    const nextIndex = adapters.findIndex((adapter) => adapter.id === forge);

    setPanelDirection(nextIndex < currentIndex ? 'left' : 'right');
    setPreviousAdapter(activeAdapter);
    setActiveForge(forge);
  };

  // Drop the outgoing secondary content once its exit animation finishes so the
  // two layers do not remain stacked (and focusable) afterwards.
  useEffect(() => {
    if (!previousAdapter) {
      return;
    }

    previousTimer.current = setTimeout(() => setPreviousAdapter(null), PANEL_TRANSITION_MS);

    return () => {
      if (previousTimer.current) {
        clearTimeout(previousTimer.current);
      }
    };
  }, [previousAdapter]);

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

      const from = (location.state as { from?: Location } | null)?.from;
      const destination = from
        ? { hash: from.hash, pathname: from.pathname, search: from.search }
        : '/';

      void navigate(destination, { replace: true });
    }
    // oxlint-disable-next-line react/exhaustive-deps -- navigate is stable; read the entry location once at the login transition
  }, [isLoggedIn]);

  return (
    <div
      className="gitify-login-scroll flex h-screen w-full overflow-y-auto pt-6"
      data-testid="login-scroll-container"
    >
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

        <div className="flex w-full max-w-[23rem] flex-col gap-2">
          {adapters.length > 1 && (
            <div
              aria-label={t('login.choose_forge', 'Choose a forge')}
              className={cn(
                'motion-reduce:animate-none animate-login-fade-up',
                'relative flex w-full items-center rounded-full',
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
                    'transition-[left,width] duration-[280ms] ease-login-out',
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
                      'relative z-10 inline-flex flex-1 cursor-pointer items-center justify-center gap-2',
                      'px-2.5 py-1.5 text-sm font-medium',
                      'transition-[color] duration-[280ms] ease-login-out',
                      'max-[30rem]:px-2 max-[30rem]:text-xs',
                      'outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--focus-outlineColor)]',
                      isActive
                        ? 'text-[var(--fgColor-default)]'
                        : 'text-[var(--fgColor-muted)] hover:text-[var(--fgColor-default)]',
                    )}
                    data-testid={`forge-tab-${adapter.id}`}
                    key={adapter.id}
                    onClick={() => selectForge(adapter.id)}
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
            className="w-full"
            id={`forge-panel-${activeAdapter.id}`}
            role="tabpanel"
          >
            <Stack align="stretch" direction="vertical" gap="condensed">
              <LoginPrimaryAction adapter={activeAdapter} onNavigate={(route) => navigate(route)} />

              <div className="relative min-h-[7.5rem] w-full">
                {previousAdapter && (
                  <div
                    aria-hidden="true"
                    className={cn(
                      'pointer-events-none absolute inset-0 motion-reduce:hidden',
                      'will-change-[opacity,transform]',
                      panelDirection === 'right'
                        ? 'animate-login-panel-out-left'
                        : 'animate-login-panel-out-right',
                    )}
                    data-testid="previous-forge-panel"
                    inert
                    key={`previous-${previousAdapter.id}`}
                  >
                    <LoginSecondaryMethods
                      adapter={previousAdapter}
                      onNavigate={(route) => navigate(route)}
                    />
                  </div>
                )}

                <div
                  className={cn(
                    'motion-reduce:animate-none will-change-[opacity,transform]',
                    panelDirection === 'right'
                      ? 'animate-login-panel-in-right'
                      : 'animate-login-panel-in-left',
                    'w-full',
                  )}
                  data-testid="active-forge-panel"
                  key={activeAdapter.id}
                >
                  <LoginSecondaryMethods
                    adapter={activeAdapter}
                    onNavigate={(route) => navigate(route)}
                  />
                </div>
              </div>
            </Stack>
          </div>
        </div>
      </Stack>
    </div>
  );
}
