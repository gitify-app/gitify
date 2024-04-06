import * as React from 'react';

export const MissingScopes = () => {
  return (
    <div className="flex flex-1 flex-col justify-center items-center p-4 bg-white dark:bg-gray-dark text-black dark:text-white">
      <h1 className="text-5xl mb-5">🙃</h1>

      <h2 className="font-semibold text-xl mb-2 text-semibold">
        Missing Scopes.
      </h2>
      <div>
        You are missing the <code>notifications</code> API scope.
      </div>
    </div>
  );
};
