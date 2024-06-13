import { type FC, useMemo } from 'react';
import type { GitifyError } from '../types';

interface IProps {
  error: GitifyError;
}

export const Oops: FC<IProps> = ({ error }) => {
  const emoji = useMemo(
    () => error.emojis[Math.floor(Math.random() * error.emojis.length)],
    [error],
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white p-4 text-black dark:bg-gray-dark dark:text-white">
      <h1 className="mb-5 text-5xl">{emoji}</h1>

      <h2 className="mb-2 text-xl font-semibold">{error.title}</h2>
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
