import { type DocumentNode, parse, print } from 'graphql';

import type { TypedDocumentString } from './generated/graphql';

// AST-based helpers for robust fragment parsing and deduping

function toDocumentNode(
  doc: TypedDocumentString<unknown, unknown>,
): DocumentNode {
  return parse(doc.toString());
}

export function getQueryFragmentBody(
  doc: TypedDocumentString<unknown, unknown>,
): string | null {
  const ast: DocumentNode = toDocumentNode(doc);

  for (const def of ast.definitions) {
    if (
      def.kind === 'FragmentDefinition' &&
      def.typeCondition.name.value === 'Query'
    ) {
      // Print just the fragment selection set body (without outer braces)
      const printed = print(def);
      const open = printed.indexOf('{');
      const close = printed.lastIndexOf('}');

      if (open !== -1 && close !== -1 && close > open) {
        return printed.slice(open + 1, close).trim();
      }
    }
  }
  return null;
}

export function extractFragments(
  doc: TypedDocumentString<unknown, unknown>,
): Map<string, string> {
  const ast: DocumentNode = toDocumentNode(doc);

  const map = new Map<string, string>();

  for (const def of ast.definitions) {
    if (def.kind === 'FragmentDefinition') {
      const name = def.name.value;

      if (!map.has(name)) {
        map.set(name, print(def));
      }
    }
  }

  return map;
}

export function extractFragmentsAll(
  docs: Array<TypedDocumentString<unknown, unknown>>,
): Map<string, string> {
  const out = new Map<string, string>();

  for (const doc of docs) {
    const m = extractFragments(doc);

    for (const [k, v] of m) {
      if (!out.has(k)) {
        out.set(k, v);
      }
    }
  }

  return out;
}

// Helper to compose a merged query given selections, fragments and variable defs
export function composeMergedQuery(
  selections: string[],
  fragmentMap: Map<string, string>,
  variableDefinitions: string[],
): string {
  const vars = variableDefinitions.join(', ');
  const frags = Array.from(fragmentMap.values()).join('\n');
  return `query FetchMergedNotifications(${vars}) {\n${selections.join('\n')}\n}\n\n${frags}\n`;
}

/**
 * Alias the root field and suffix key variables with the provided index.
 *
 * Example:
 *   repository(owner: $owner, name: $name) { issue(number: $number) { ...IssueDetails } }
 * becomes:
 *   nodeINDEX: repository(owner: $ownerINDEX, name: $nameINDEX) { issue(number: $numberINDEX) { ...IssueDetails } }
 */
export function aliasRootAndKeyVariables(
  selectionBody: string,
  index: number | string,
): string {
  const idx = String(index);
  const alias = `node${idx}`;

  // Add alias to the first root field name
  const withAlias = selectionBody.replace(
    /^\s*([_A-Za-z][_A-Za-z0-9]*)/,
    (_m, name: string) => `${alias}: ${name}`,
  );

  // First, convert key variables to INDEX placeholders so we can alias them.
  // Keys: owner, name, number, isDiscussionNotification, isIssueNotification, isPullRequestNotification
  const withIndexPlaceholders = withAlias.replace(
    /\$(owner|name|number|isDiscussionNotification|isIssueNotification|isPullRequestNotification)\b/g,
    (_m, v: string) => `$${v}INDEX`,
  );

  // Only alias variables that explicitly end with `INDEX`.
  // Example: $ownerINDEX -> $owner0, $nameINDEX -> $name0
  const withIndexedVars = withIndexPlaceholders.replace(
    /\$([_A-Za-z][_A-Za-z0-9]*)INDEX\b/g,
    (_m, v: string) => `$${v}${idx}`,
  );

  return withIndexedVars;
}
