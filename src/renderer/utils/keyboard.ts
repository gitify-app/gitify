export function shouldIgnoreKeyboardEvent(event: KeyboardEvent): boolean {
  return (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey
  );
}

export function getNormalizedKey(event: KeyboardEvent): string {
  return event.key.toLowerCase();
}
