import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { Button, Stack } from '@primer/react';

import { EmojiSplash } from './layout/EmojiSplash';

import type { GitifyError, GitifyErrorAction } from '../types';

import { getErrorDetails } from '../utils/core/errors';
import { randomElement } from '../utils/core/random';

export interface RecoveryAction {
  label: string;
  icon: GitifyErrorAction['icon'];
  onClick: () => void;
}

interface OopsProps {
  error: GitifyError;
  fullHeight?: boolean;
  /** Context-specific recovery action rendered after the error's route actions. */
  recovery?: RecoveryAction;
}

export function Oops({ error, fullHeight = true, recovery }: Readonly<OopsProps>) {
  const navigate = useNavigate();

  const err = error ?? getErrorDetails('UNKNOWN');

  const emoji = useMemo(() => randomElement(err.emojis), [err]);

  const errorActions = err.actions?.length
    ? err.actions.map((action) => (
        <Button
          key={action.route}
          leadingVisual={action.icon}
          onClick={() => navigate(action.route)}
          variant={action.variant}
        >
          {action.label}
        </Button>
      ))
    : null;

  const recoveryAction = recovery ? (
    <Button key="recovery" leadingVisual={recovery.icon} onClick={recovery.onClick}>
      {recovery.label}
    </Button>
  ) : null;

  const actions = recoveryAction ? (
    <Stack direction="horizontal" gap="condensed">
      {errorActions}
      {recoveryAction}
    </Stack>
  ) : (
    errorActions
  );

  return (
    <EmojiSplash
      actions={actions}
      emoji={emoji}
      fullHeight={fullHeight}
      heading={err.title}
      subHeadings={err.descriptions}
    />
  );
}
