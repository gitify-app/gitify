import * as React from 'react';
import Typist from 'react-typist';
import { emojify } from 'react-emojione';

import constants from '../utils/constants';

export const AllRead = () => {
  const message = React.useMemo(
    () =>
      constants.ALLREAD_MESSAGES[
        Math.floor(Math.random() * constants.ALLREAD_MESSAGES.length)
      ],
    []
  );

  const emoji = React.useMemo(
    () =>
      constants.ALLREAD_EMOJIS[
        Math.floor(Math.random() * constants.ALLREAD_EMOJIS.length)
      ],
    []
  );

  return (
    <div className="flex flex-1 flex-col justify-center items-center p-4">
      <h1 className="text-5xl mb-5">{emojify(emoji, { output: 'unicode' })}</h1>

      <h2 className="font-semibold text-xl mb-2 text-semibold">
        <Typist>{message}</Typist>
      </h2>

      <div>No new notifications.</div>
    </div>
  );
};
