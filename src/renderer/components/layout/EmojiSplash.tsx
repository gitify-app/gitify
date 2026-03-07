import type { FC, ReactNode } from 'react';

import { Stack } from '@primer/react';

import { EmojiText } from '../primitives/EmojiText';

import { Centered } from './Centered';

interface EmojiSplashProps {
  emoji: string;
  heading: string;
  subHeadings?: string[];
  fullHeight?: boolean;
  actions?: ReactNode;
}

export const EmojiSplash: FC<EmojiSplashProps> = ({
  fullHeight = true,
  subHeadings = [],
  actions,
  ...props
}: EmojiSplashProps) => {
  return (
    <Centered fullHeight={fullHeight}>
      <Stack
        align="center"
        direction="vertical"
        gap="condensed"
        justify={'center'}
      >
        <Stack align="center" direction="vertical" gap="spacious">
          <EmojiText text={props.emoji} />
          <div className="text-xl font-semibold">{props.heading}</div>
        </Stack>

        {subHeadings.map((description, i) => {
          const key = `error_description_${i}`;
          return (
            <div className="text-center" key={key}>
              {description}
            </div>
          );
        })}

        {actions && <div className="mt-2">{actions}</div>}
      </Stack>
    </Centered>
  );
};
