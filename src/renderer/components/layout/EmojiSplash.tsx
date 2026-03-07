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

export const EmojiSplash: FC<EmojiSplashProps> = (props: EmojiSplashProps) => {
  return (
    <Centered fullHeight={props.fullHeight}>
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

        {props.subHeadings?.map((description, i) => {
          const key = `error_description_${i}`;
          return (
            <div className="text-center" key={key}>
              {description}
            </div>
          );
        })}

        {props.actions && <div className="mt-2">{props.actions}</div>}
      </Stack>
    </Centered>
  );
};
