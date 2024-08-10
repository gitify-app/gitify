import { type FC, useMemo } from 'react';
import type { GitifyError } from '../types';
import { EmojiText } from './EmojiText';

interface IOops {
  error: GitifyError;
}

export const Oops: FC<IOops> = ({ error }: IOops) => {
  const emoji = useMemo(
    () => error.emojis[Math.floor(Math.random() * error.emojis.length)],
    [error],
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="mt-2 mb-5 text-5xl">
        <EmojiText text={`${emoji} foo`} />
      </div>

      <div className="mb-2 text-xl font-semibold">{error.title}</div>
      {error.descriptions.map((description, i) => {
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: using index for key to keep the error constants clean
          <div className="mb-2 text-center" key={`error_description_${i}`}>
            {description}
          </div>
        );
      })}
    </div>
  );
};
