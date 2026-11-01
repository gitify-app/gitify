import { useMemo } from 'react';

import { Button } from '@primer/react';

import { useAppNavigate } from '../hooks/useAppNavigate';

import { EmojiSplash } from './layout/EmojiSplash';

import type { GitifyError } from '../types';

import { getErrorDetails } from '../utils/core/errors';
import { randomElement } from '../utils/core/random';

interface OopsProps {
  error: GitifyError;
  fullHeight?: boolean;
}

export function Oops({ error, fullHeight = true }: Readonly<OopsProps>) {
  const navigate = useAppNavigate();

  const err = error ?? getErrorDetails('UNKNOWN');

  const emoji = useMemo(() => randomElement(err.emojis), [err]);

  const actions = err.actions?.length
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
