import { useTranslation } from 'react-i18next';

import { Button, Stack, Text } from '@primer/react';

import type { ForgeAdapter, LoginMethodDescriptor } from '../../utils/forges/types';

import {
  compactLoginMethodLabel,
  translateForgeTagline,
  translateLoginMethodLabel,
} from '../../utils/forges/labels';

/**
 * Pick the method that should drive the dominant CTA for a forge.
 * Falls back to the first registered method when no `primary` variant exists.
 */
function pickPrimaryMethod(adapter: ForgeAdapter): LoginMethodDescriptor | undefined {
  return adapter.loginMethods.find((m) => m.variant === 'primary') ?? adapter.loginMethods[0];
}

interface LoginForgePanelProps {
  adapter: ForgeAdapter;
  /** The visible panel owns the tabpanel role; the outgoing clone does not. */
  isActive: boolean;
  onNavigate: (route: string) => void;
}

/**
 * Method panel for one forge. Rendered twice during a forge transition: the
 * outgoing copy stays visible while the incoming copy fades in.
 */
export function LoginForgePanel({ adapter, isActive, onNavigate }: Readonly<LoginForgePanelProps>) {
  const { t } = useTranslation();

  const primary = pickPrimaryMethod(adapter);
  const alternates = adapter.loginMethods.filter((method) => method !== primary);

  return (
    <div
      aria-labelledby={isActive ? `forge-tab-${adapter.id}` : undefined}
      className="w-full"
      id={isActive ? `forge-panel-${adapter.id}` : undefined}
      role={isActive ? 'tabpanel' : undefined}
    >
      <Stack align="stretch" direction="vertical" gap="condensed">
        {primary && (
          <Button
            block
            data-testid={primary.testId}
            leadingVisual={primary.icon}
            onClick={() => onNavigate(primary.route)}
            variant="primary"
          >
            {t('login.continue_with', 'Continue with {{name}}', {
              name: adapter.displayName,
            })}
          </Button>
        )}

        {alternates.length > 0 && (
          <div className="flex flex-col gap-2">
            <div aria-hidden="true" className="flex items-center gap-2">
              <span className="h-px flex-1 bg-[var(--borderColor-default)]" />
              <span className="text-[var(--fgColor-muted)] text-xxs">{t('login.or', 'or')}</span>
              <span className="h-px flex-1 bg-[var(--borderColor-default)]" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {alternates.map((method) => (
                <Button
                  aria-label={translateLoginMethodLabel(method.label)}
                  data-testid={method.testId}
                  key={method.testId}
                  leadingVisual={method.icon}
                  onClick={() => onNavigate(method.route)}
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

        {adapter.tagline && (
          <Text
            as="p"
            className="pt-1 text-center text-[var(--fgColor-muted)] text-xxs"
            size="small"
          >
            {translateForgeTagline(adapter.tagline)}
          </Text>
        )}
      </Stack>
    </div>
  );
}
