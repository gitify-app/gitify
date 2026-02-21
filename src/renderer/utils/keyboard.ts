export const shouldIgnoreKeyboardEvent = (event: KeyboardEvent): boolean => {
  return (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey
  );
};

export const getNormalizedKey = (event: KeyboardEvent): string =>
  event.key.toLowerCase();
