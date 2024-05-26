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
    <div className="flex flex-1 flex-col justify-center items-center p-4 bg-white dark:bg-gray-dark text-black dark:text-white">
      <h1 className="text-5xl mb-5">{emoji}</h1>

      <h2 className="font-semibold text-xl mb-2 text-semibold">
        {error.title}
      </h2>
      {error.descriptions.map((description, i) => {
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: using index for key to keep the error constants clean
          <div className="text-center mb-2" key={`error_description_${i}`}>
            {description}
          </div>
        );
      })}
    </div>
  );
};
