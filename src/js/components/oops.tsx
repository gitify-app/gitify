import * as React from 'react';
import { emojify } from 'react-emojione';

import constants from '../utils/constants';

export const Oops = () => {
  const emoji =
    constants.ERROR_EMOJIS[
      Math.floor(Math.random() * constants.ERROR_EMOJIS.length)
    ];

  return (
    <div className="flex flex-1 flex-col justify-center items-center p-4">
      <h1 className="text-5xl mb-5">{emojify(emoji, { output: 'unicode' })}</h1>

      <h2 className="font-semibold text-xl mb-2 text-semibold">
        Something went wrong.
      </h2>
      <div>Couldn&apos;t get your notifications.</div>
    </div>
  );
};
