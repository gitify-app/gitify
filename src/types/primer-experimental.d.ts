// Shim module for @primer/react/experimental under commonjs moduleResolution
// Provides Banner (still experimental) and Dialog (now stable export)
// to keep existing import statements working after upgrade to v37.
declare module '@primer/react/experimental' {
  export { Banner } from '@primer/react/lib-esm/Banner';
  export { Dialog } from '@primer/react';
}
