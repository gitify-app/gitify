import { type DocumentNode, parse, print, type TypeNode } from 'graphql';

import type { TypedDocumentString } from './generated/graphql';
import type { FragmentInfo, VariableDef } from './types';

const INDEXED_SUFFIX = 'INDEX';

// AST-based helpers for robust fragment parsing and deduping

function toDocumentNode(
  doc: TypedDocumentString<unknown, unknown>,
): DocumentNode {
  return parse(doc.toString());
}

/**
 * GraphQL Fragment Utilities
 *
 * Extract fragments from GraphQL operation document.
 */

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
 * Extract all fragments from a GraphQL document with metadata.
 */
function extractAllFragments(
  doc: TypedDocumentString<unknown, unknown>,
): FragmentInfo[] {
  const ast: DocumentNode = toDocumentNode(doc);
  const fragments: FragmentInfo[] = [];

  for (const def of ast.definitions) {
    if (def.kind === 'FragmentDefinition') {
      const printed = print(def);
      // Use AST to print just the selection set and strip braces for `inner`
      const printedSel = def.selectionSet ? print(def.selectionSet) : '';
      const open = printedSel.indexOf('{');
      const close = printedSel.lastIndexOf('}');

      fragments.push({
        name: def.name.value,
        typeCondition: def.typeCondition.name.value,
        printed: printed,
        inner:
          open >= 0 && close >= 0
            ? printedSel.slice(open + 1, close).trim()
            : '',
      });
    }
  }

  return fragments;
}

/**
 * Alias the root field and suffix key variables with the provided index.
 *
 * Example:
 *   repository(owner: $owner, name: $name) { issue(number: $number) { ...IssueDetails } }
 * becomes:
 *   nodeINDEX: repository(owner: $ownerINDEX, name: $nameINDEX) { issue(number: $numberINDEX) { ...IssueDetails } }
 */
export function aliasNodeAndRenameQueryVariables(
  alias: string,
  index: number,
  selectionBody: string,
): string {
  const idx = String(index);

  // Add alias to the first root field name
  const withAlias = selectionBody.replace(
    /^\s*([A-Za-z_]\w*)/,
    (_m, name: string) => `${alias}${idx}: ${name}`,
  );

  // Only alias variables that explicitly end with `INDEX`.
  // Example: $ownerINDEX -> $owner0, $nameINDEX -> $name0
  const withIndexedVars = withAlias.replace(
    /\$([A-Za-z_]\w*)INDEX\b/g,
    (_m, v: string) => `$${v}${idx}`,
  );

  return withIndexedVars;
}

/**
 * GraphQL Variable Definition Utilities
 *
 * Extract variable definitions from a GraphQL document's operations.
 * Returns strings like `$var: Type` suitable for insertion into a query definition.
 */

export function extractIndexedVariableDefinitions(
  doc: TypedDocumentString<unknown, unknown>,
): VariableDef[] {
  const all = extractVariableDefinitions(doc);
  return filterVariableDefinitionsByIndexSuffix(all, true);
}

export function extractNonIndexedVariableDefinitions(
  doc: TypedDocumentString<unknown, unknown>,
): VariableDef[] {
  const all = extractVariableDefinitions(doc);
  return filterVariableDefinitionsByIndexSuffix(all, false);
}

function filterVariableDefinitionsByIndexSuffix(
  variableDefs: VariableDef[],
  indexed: boolean,
): VariableDef[] {
  return variableDefs.filter(
    (varDef) => varDef.name.endsWith(INDEXED_SUFFIX) === indexed,
  );
}

function extractVariableDefinitions(
  doc: TypedDocumentString<unknown, unknown>,
): VariableDef[] {
  const ast = toDocumentNode(doc);
  const defs: VariableDef[] = [];

  for (const def of ast.definitions) {
    if (def.kind === 'OperationDefinition' && def.variableDefinitions) {
      for (const v of def.variableDefinitions) {
        const name = v.variable.name.value;
        defs.push({ name: name, type: formatType(v.type) });
      }
    }
  }

  return defs;
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
