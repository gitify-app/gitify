import { faWifi } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type FC, useMemo } from 'react';
import type { GitifyError } from '../types';

interface IOops {
  error: GitifyError;
}

export const Oops: FC<IOops> = ({ error }: IOops) => {
  const faIcon = useMemo(
    () => error.icons[Math.floor(Math.random() * error.icons.length)],
    [error],
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <h1 className="mt-2 mb-5 text-5xl">
        <FontAwesomeIcon
          icon={faIcon}
          color={faIcon === faWifi ? 'blue' : ''}
        />
      </h1>

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
