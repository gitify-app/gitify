import { type FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@primer/react';

import { EmojiSplash } from './layout/EmojiSplash';

import type { GitifyError } from '../types';

import { Errors } from '../utils/core/errors';
import { randomElement } from '../utils/core/random';

interface OopsProps {
  error: GitifyError;
  fullHeight?: boolean;
}

export const Oops: FC<OopsProps> = ({
  error,
  fullHeight = true,
}: OopsProps) => {
  const err = error ?? Errors.UNKNOWN;
  const navigate = useNavigate();

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
};
