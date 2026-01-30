// Simple utility to centralize online status checks
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

export default isOnline;
