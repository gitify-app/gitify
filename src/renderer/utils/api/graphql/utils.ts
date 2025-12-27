export function getQueryFragmentBody(doc: string): string | null {
  // Find fragment on Query pattern
  const fragmentMatch = doc.match(/fragment\s+\w+\s+on\s+Query\s+\{/);
  if (!fragmentMatch) {
    return null;
  }

  const start = fragmentMatch.index + fragmentMatch[0].length - 1; // Position of opening brace
  let depth = 0;

  for (let i = start; i < doc.length; i++) {
    if (doc[i] === '{') {
      depth++;
    } else if (doc[i] === '}') {
      depth--;
      if (depth === 0) {
        return doc.slice(start + 1, i).trim();
      }
    }
  }
  return null;
}
