export function createLogger() {
  return () => next => action => {
    return next(action);
  };
}
