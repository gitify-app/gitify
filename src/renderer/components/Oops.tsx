import { type ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { Button, Stack } from '@primer/react';

import { EmojiSplash } from './layout/EmojiSplash';

import type { GitifyError } from '../types';

import { getErrorDetails } from '../utils/core/errors';
import { randomElement } from '../utils/core/random';

interface OopsProps {
  error: GitifyError;
  fullHeight?: boolean;
  /** Actions rendered after the error's own route actions. */
  extraActions?: ReactNode;
}

export function Oops({ error, fullHeight = true, extraActions }: Readonly<OopsProps>) {
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

  const actions = extraActions ? (
    <Stack direction="horizontal" gap="condensed">
      {errorActions}
      {extraActions}
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
