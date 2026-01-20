import type { FragmentInfo, VariableDef } from './types';

import {
  type Exact,
  FetchMergedDetailsTemplateDocument,
  type FetchMergedDetailsTemplateQueryVariables,
} from './generated/graphql';
import {
  aliasFieldAndSubstituteIndexedVars,
  extractIndexedVariableDefinitions,
  extractNonIndexedVariableDefinitions,
  extractNonQueryFragments,
  extractQueryFragments,
} from './utils';

// From merged.graphql template operation
const TemplateDocument = FetchMergedDetailsTemplateDocument;
type TemplateVariables = FetchMergedDetailsTemplateQueryVariables;

// Preserve exact Scalar-based variable value types via the generated QueryVariables
type VariableValue = TemplateVariables[keyof TemplateVariables];

// Split variables by the `INDEX` suffix using the generated QueryVariables type
type IndexedKeys = Extract<keyof TemplateVariables, `${string}INDEX`>;
type NonIndexedKeys = Exclude<keyof TemplateVariables, IndexedKeys>;

// Transform `${Base}INDEX` keys to just `Base` while preserving value types
type DeindexKeys<T> = {
  [K in keyof T as K extends `${infer B}INDEX` ? B : never]: T[K];
};

type FetchBatchMergedTemplateIndexedVariables = Pick<
  TemplateVariables,
  IndexedKeys
>;

// Base-key form (e.g., `owner`, `name`, `number`, ...) without `INDEX` suffix
export type FetchBatchMergedTemplateIndexedBaseVariables =
  DeindexKeys<FetchBatchMergedTemplateIndexedVariables>;

export type FetchBatchMergedTemplateNonIndexedVariables = Pick<
  TemplateVariables,
  NonIndexedKeys
>;

export class MergeQueryBuilder {
  private readonly selections: string[] = [];
  private readonly variableDefinitions: VariableDef[] = [];
  private readonly variableValues: Record<string, VariableValue> = {};
  private readonly fragments: FragmentInfo[] = [];

  // Precomputed, invariant template-derived data (computed once per module load)
  private static readonly TEMPLATE_FRAGMENTS =
    extractNonQueryFragments(TemplateDocument);
  private static readonly TEMPLATE_QUERY_INNER = (() => {
    const queryFrags = extractQueryFragments(TemplateDocument);
    return queryFrags.length ? queryFrags[0].inner : null;
  })();
  private static readonly TEMPLATE_NON_INDEXED_DEFS =
    extractNonIndexedVariableDefinitions(TemplateDocument);
  private static readonly TEMPLATE_INDEXED_VAR_DEFS =
    extractIndexedVariableDefinitions(TemplateDocument);

  constructor() {
    // Add precomputed static fragments
    this.fragments.push(...MergeQueryBuilder.TEMPLATE_FRAGMENTS);

    // Add common/shared (non-indexed) variable definitions from the template document
    this.addVariableDefinitions(MergeQueryBuilder.TEMPLATE_NON_INDEXED_DEFS);
  }

  /**
   * Add selection set.
   */
  addSelection(selection: string): this {
    if (selection) {
      this.selections.push(selection);
    }
    return this;
  }

  /**
   * Add GraphQL variable definition
   */
  addVariableDefinitions(defs: VariableDef[]): this {
    if (defs) {
      this.variableDefinitions.push(...defs);
    }
    return this;
  }

  /**
   * Add GraphQL variable with value
   */
  setVariableValue(name: string, value: VariableValue): this {
    this.variableValues[name] = value;
    return this;
  }

  /**
   * Set shared (non-indexed) variables
   */
  setSharedVariables(
    values: Exact<FetchBatchMergedTemplateNonIndexedVariables>,
  ): this {
    for (const [name, value] of Object.entries(values)) {
      this.setVariableValue(name, value as VariableValue);
    }
    return this;
  }

  /**
   * Add a new selection set (ie: node) to the query.
   * @param values The values for the selection set variables/arguments.
   * @returns the computed node alias name
   */
  addNode(values: Exact<FetchBatchMergedTemplateIndexedBaseVariables>): string {
    const index = this.selections.length;
    const aliasWithIndex = `node${index}`;
    this.addSelectionNodeFromQueryTemplate(aliasWithIndex, index, values);
    return aliasWithIndex;
  }

  /**
   * Add a new selection set (ie: node) to the query.
   */
  private addSelectionNodeFromQueryTemplate(
    alias: string,
    index: number,
    values: Exact<FetchBatchMergedTemplateIndexedBaseVariables>,
  ): this {
    const selection = aliasFieldAndSubstituteIndexedVars(
      alias,
      index,
      MergeQueryBuilder.TEMPLATE_QUERY_INNER,
    );
    this.addSelection(selection);

    const renamedIndexVarDefs: VariableDef[] =
      MergeQueryBuilder.TEMPLATE_INDEXED_VAR_DEFS.map((varDef) => {
        return {
          name: varDef.name.replace('INDEX', `${index}`),
          type: varDef.type,
        };
      });

    this.addVariableDefinitions(renamedIndexVarDefs);

    for (const [base, val] of Object.entries(values)) {
      this.setVariableValue(`${base}${index}`, val);
    }

    return this;
  }

  /**
   * Returns a formatted GraphQL Query operation document/statement.
   */
  getGraphQLQuery(docName = 'FetchMergedNotifications'): string {
    const variablesDefinitions = this.variableDefinitions
      .map((varDef) => `$${varDef.name}: ${varDef.type}`)
      .join(', ');

    const selections = this.selections.join('\n');

    const fragments = this.fragments.map((f) => f.printed).join('\n');

    return `query ${docName}(${variablesDefinitions}) {\n${selections}\n}\n\n${fragments}\n`;
  }

  /**
   * Return the GraphQL Query Variables.
   */
  getGraphQLVariables(): Record<string, VariableValue> {
    return this.variableValues;
  }
}
