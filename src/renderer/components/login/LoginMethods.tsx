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

interface LoginPrimaryActionProps {
  adapter: ForgeAdapter;
  onNavigate: (route: string) => void;
}

/**
 * The filled primary CTA. It stays mounted across forge changes so the green
 * button never fades or dims during the secondary-content transition.
 */
export function LoginPrimaryAction({ adapter, onNavigate }: Readonly<LoginPrimaryActionProps>) {
  const { t } = useTranslation();
  const primary = pickPrimaryMethod(adapter);

  if (!primary) {
    return null;
  }

  return (
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
  );
}

interface LoginSecondaryMethodsProps {
  adapter: ForgeAdapter;
  onNavigate: (route: string) => void;
}

/**
 * The forge-specific secondary content below the primary CTA: the "or"
 * divider, the alternate method buttons, and the forge tagline.
 */
export function LoginSecondaryMethods({
  adapter,
  onNavigate,
}: Readonly<LoginSecondaryMethodsProps>) {
  const { t } = useTranslation();

  const primary = pickPrimaryMethod(adapter);
  const alternates = adapter.loginMethods.filter((method) => method !== primary);

  return (
    <Stack align="stretch" direction="vertical" gap="condensed">
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

      {/* Primer's base `p` margin adds a 10px tail below the last line, which
          makes the footer look off-centre. Keep the box flush with its text. */}
      {adapter.tagline && (
        <Text
          as="p"
          className="pt-1 text-center text-[var(--fgColor-muted)] text-xxs"
          size="small"
          style={{ marginBottom: 0 }}
        >
          {translateForgeTagline(adapter.tagline)}
        </Text>
      )}
    </Stack>
  );
}
