/**
 * Jest Global Setup
 * This runs once before all test suites
 * Sets timezone to UTC for consistent date/time in tests and snapshots
 */
export default () => {
  process.env.TZ = 'UTC';
};
