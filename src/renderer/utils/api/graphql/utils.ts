import { type DocumentNode, parse, print, type TypeNode } from 'graphql';

import type { TypedDocumentString } from './generated/graphql';

// AST-based helpers for robust fragment parsing and deduping

function toDocumentNode(
  doc: TypedDocumentString<unknown, unknown>,
): DocumentNode {
  return parse(doc.toString());
}

export type FragmentInfo = {
  name: string;
  typeCondition: string;
  printed: string;
  inner: string;
};

/**
 * Extract all fragments from a GraphQL document with metadata.
 */
export function extractAllFragments(
  doc: TypedDocumentString<unknown, unknown>,
): FragmentInfo[] {
  const ast: DocumentNode = toDocumentNode(doc);
  const fragments: FragmentInfo[] = [];

  for (const def of ast.definitions) {
    if (def.kind === 'FragmentDefinition') {
      const printed = print(def);
      const open = printed.indexOf('{');
      const close = printed.lastIndexOf('}');

      fragments.push({
        name: def.name.value,
        typeCondition: def.typeCondition.name.value,
        printed: printed,
        inner: printed.slice(open + 1, close).trim(),
      });
    }
  }

  return fragments;
}

/**
 * Return only `Query` fragments from a GraphQL document.
 */
export function extractQueryFragments(
  doc: TypedDocumentString<unknown, unknown>,
): FragmentInfo[] {
  return extractAllFragments(doc).filter((f) => f.typeCondition === 'Query');
}

/**
 * Return all non-`Query` fragments from a GraphQL document.
 */
export function extractNonQueryFragments(
  doc: TypedDocumentString<unknown, unknown>,
): FragmentInfo[] {
  return extractAllFragments(doc).filter((f) => f.typeCondition !== 'Query');
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
  rootAlias: string,
  index: number,
  selectionBody: string,
): string {
  const idx = String(index);

  // Add alias to the first root field name
  const withAlias = selectionBody.replace(
    /^\s*([_A-Za-z][_A-Za-z0-9]*)/,
    (_m, name: string) => `${rootAlias}: ${name}`,
  );

  // Only alias variables that explicitly end with `INDEX`.
  // Example: $ownerINDEX -> $owner0, $nameINDEX -> $name0
  const withIndexedVars = withAlias.replace(
    /\$([_A-Za-z][_A-Za-z0-9]*)INDEX\b/g,
    (_m, v: string) => `$${v}${idx}`,
  );

  return withIndexedVars;
}

export function extractArgumentNames(selectionBody: string): Set<string> {
  const names = new Set<string>();
  const regex = /\$([_A-Za-z][_A-Za-z0-9]*)\b/g;
  let match: RegExpExecArray | null = regex.exec(selectionBody);

  while (match !== null) {
    names.add(match[1]);
    match = regex.exec(selectionBody);
  }

  return names;
}

export function filterArgumentsByIndexSuffix(
  args: Iterable<string>,
  indexed: boolean,
): string[] {
  return Array.from(args).filter((name) => name.endsWith('INDEX') === indexed);
}

export function extractIndexedArguments(selectionBody: string): string[] {
  const all = extractArgumentNames(selectionBody);
  return filterArgumentsByIndexSuffix(all, true);
}

export function extractNonIndexedArguments(selectionBody: string): string[] {
  const all = extractArgumentNames(selectionBody);
  return filterArgumentsByIndexSuffix(all, false);
}

// Format a GraphQL TypeNode to a string (e.g., Int, Boolean!, [String!])
function formatType(type: TypeNode): string {
  switch (type.kind) {
    case 'NamedType':
      return type.name.value;
    case 'NonNullType':
      return `${formatType(type.type)}!`;
    case 'ListType':
      return `[${formatType(type.type)}]`;
    default:
      return '';
  }
}

/**
 * Extract non-indexed variable definitions from a GraphQL document's operations.
 * Returns strings like `$var: Type` suitable for insertion into a query definition.
 */
export function extractNonIndexedVariableDefinitions(
  doc: TypedDocumentString<unknown, unknown>,
): string[] {
  const ast = toDocumentNode(doc);
  const defs: string[] = [];

  for (const def of ast.definitions) {
    if (def.kind === 'OperationDefinition' && def.variableDefinitions) {
      for (const v of def.variableDefinitions) {
        const name = v.variable.name.value;
        if (!name.endsWith('INDEX')) {
          defs.push(`$${name}: ${formatType(v.type)}`);
        }
      }
    }
  }

  return defs;
}
