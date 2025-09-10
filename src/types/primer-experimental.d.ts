// Shim module for @primer/react/experimental under commonjs moduleResolution
// to keep existing import statements working after upgrade to v37.
// TODO - remove this file after all experimental components have been migrated
declare module '@primer/react/experimental' {
 export { Banner } from '@primer/react/lib-esm/Banner';
}
