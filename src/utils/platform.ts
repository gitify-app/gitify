export function isLinux(): boolean {
  return process.platform === 'linux';
}

export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

export function isWindows(): boolean {
  return process.platform === 'win32';
}
