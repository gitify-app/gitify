export function formatAsGitHubSearchSyntax(
  repo: string,
  title: string,
): string {
  return `"${title}" in:title repo:${repo}`;
}
