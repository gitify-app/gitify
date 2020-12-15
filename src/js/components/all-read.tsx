import * as React from 'react';
import Typist from 'react-typist';
import { emojify } from 'react-emojione';

import { Constants } from '../../utils/Constants';

export const AllRead = () => {
  const message = React.useMemo(
    () =>
      Constants.ALLREAD_MESSAGES[
        Math.floor(Math.random() * Constants.ALLREAD_MESSAGES.length)
      ],
    []
  );

  const emoji = React.useMemo(
    () =>
      Constants.ALLREAD_EMOJIS[
        Math.floor(Math.random() * Constants.ALLREAD_EMOJIS.length)
      ],
    []
  );

  return (
    <div className="flex flex-1 flex-col justify-center items-center p-4 bg-white dark:bg-gray-dark text-black dark:text-white">
      <h1 className="text-5xl mb-5">{emojify(emoji, { output: 'unicode' })}</h1>

      <h2 className="font-semibold text-xl mb-2 text-semibold">
        <Typist>{message}</Typist>
      </h2>

      <div>No new notifications.</div>
    </div>
  );
};
