/**
 * Jest Global Setup
 * This runs once before all test suites
 */
export default () => {
  // Sets timezone to UTC for consistent date/time in tests and snapshots
  process.env.TZ = 'UTC';
};
