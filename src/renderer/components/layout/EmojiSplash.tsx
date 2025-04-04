import { Box, Stack } from '@primer/react';
import type { FC } from 'react';

import { EmojiText } from '../primitives/EmojiText';
import { Centered } from './Centered';

interface IEmojiSplash {
  emoji: string;
  heading: string;
  subHeadings?: string[];
  fullHeight?: boolean;
}

export const EmojiSplash: FC<IEmojiSplash> = ({
  fullHeight = true,
  subHeadings = [],
  ...props
}: IEmojiSplash) => {
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
          <Box className="text-xl font-semibold">{props.heading}</Box>
        </Stack>

        {subHeadings.map((description, i) => {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: using index for key to keep the error constants clean
            <Box key={`error_description_${i}`} className="text-center">
              {description}
            </Box>
          );
        })}
      </Stack>
    </Centered>
  );
};
