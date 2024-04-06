import * as React from 'react';

export const RateLimit = () => {
  return (
    <div className="flex flex-1 flex-col justify-center items-center p-4 bg-white dark:bg-gray-dark text-black dark:text-white">
      <h1 className="text-5xl mb-5">😮‍💨</h1>

      <h2 className="font-semibold text-xl mb-2 text-semibold">
        Rate Limited.
      </h2>
      <div>You have made too many requests.</div>
    </div>
  );
};
