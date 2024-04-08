import { useMemo } from 'react';
import { Constants } from '../utils/constants';

export const AllRead = () => {
  const emoji = useMemo(
    () =>
      Constants.ALLREAD_EMOJIS[
        Math.floor(Math.random() * Constants.ALLREAD_EMOJIS.length)
      ],
    [],
  );

  return (
    <div className='flex flex-1 flex-col justify-center items-center p-4 bg-white dark:bg-gray-dark text-black dark:text-white'>
      <h1 className='text-5xl mb-5'>{emoji}</h1>

      <h2 className='font-semibold text-xl mb-2 text-semibold'>
        No new notifications.
      </h2>
    </div>
  );
};
