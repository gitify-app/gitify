import { useMemo } from 'react';
import { Constants } from '../utils/constants';

export const AllRead = () => {
  const emoji = useMemo(
    () =>
      Constants.ALL_READ_EMOJIS[
        Math.floor(Math.random() * Constants.ALL_READ_EMOJIS.length)
      ],
    [],
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white p-4 text-black dark:bg-gray-dark dark:text-white">
      <h1 className="mb-5 text-5xl">{emoji}</h1>

      <h2 className="mb-2 text-xl font-semibold">No new notifications.</h2>
    </div>
  );
};
