import {
  type Exact,
  FetchBatchMergedTemplateDocument,
  type FetchBatchMergedTemplateQueryVariables,
} from './generated/graphql';
import type { FragmentInfo, VariableDef } from './types';
import {
  aliasNodeAndRenameQueryVariables,
  extractIndexedVariableDefinitions,
  extractNonIndexedVariableDefinitions,
  extractNonQueryFragments,
  extractQueryFragments,
} from './utils';

// From merged.graphql template operation
const TemplateDocument = FetchBatchMergedTemplateDocument;
type TemplateVariables = FetchBatchMergedTemplateQueryVariables;

// Preserve exact Scalar-based variable value types via the generated QueryVariables
type VarValue = TemplateVariables[keyof TemplateVariables];

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
  private readonly variableValues: Record<string, VarValue> = {};
  private readonly fragments: FragmentInfo[] = [];

  private readonly queryFragmentInner: string | null = null;
  private readonly indexedTemplateVarDefs: VariableDef[];

  constructor() {
    this.fragments.push(...extractNonQueryFragments(TemplateDocument));

    const queryFrags = extractQueryFragments(TemplateDocument);
    this.queryFragmentInner = queryFrags.length ? queryFrags[0].inner : null;

    // Auto-add non-indexed variable definitions from the template document
    const nonIndexedDefs =
      extractNonIndexedVariableDefinitions(TemplateDocument);
    if (nonIndexedDefs.length > 0) {
      this.addVariableDefs(nonIndexedDefs);
    }

    // Precompute indexed variable definitions to avoid repeated AST parsing per node
    this.indexedTemplateVarDefs = extractIndexedVariableDefinitions(
      TemplateDocument,
    );
  }

  addSelection(selection: string): this {
    if (selection) {
      this.selections.push(selection);
    }
    return this;
  }

  addVariableDefs(defs: VariableDef[]): this {
    if (defs) {
      this.variableDefinitions.push(...defs);
    }
    return this;
  }

  setVar(name: string, value: VarValue): this {
    this.variableValues[name] = value;
    return this;
  }

  addFragments(fragments: FragmentInfo[] | undefined): this {
    if (fragments?.length) {
      this.fragments.push(...fragments);
    }
    return this;
  }

  // Set global (non-indexed) variables using the exact generated types
  setNonIndexedVars(
    values: Exact<FetchBatchMergedTemplateNonIndexedVariables>,
  ): this {
    for (const [name, value] of Object.entries(values)) {
      this.setVar(name, value as VarValue);
    }
    return this;
  }

  // Convenience: add a node and return its computed response alias
  addNode(
    alias: string,
    index: number,
    values: Exact<FetchBatchMergedTemplateIndexedBaseVariables>,
  ): string {
    this.addQueryNode(alias, index, values);
    return `${alias}${index}`;
  }

  addQueryNode(
    alias: string,
    index: number,
    values: Exact<FetchBatchMergedTemplateIndexedBaseVariables>,
  ): this {
    if (!this.queryFragmentInner) {
      return this;
    }

    const selection = aliasNodeAndRenameQueryVariables(
      alias,
      index,
      this.queryFragmentInner,
    );
    this.addSelection(selection);

    const renamedIndexVarDefs: VariableDef[] = this.indexedTemplateVarDefs.map((varDef) => {
      return {
        name: varDef.name.replace('INDEX', `${index}`),
        type: varDef.type,
      };
    });

    this.addVariableDefs(renamedIndexVarDefs);

    for (const [base, val] of Object.entries(values)) {
      this.setVar(`${base}${index}`, val);
    }

    return this;
  }

  buildQuery(docName = 'FetchMergedNotifications'): string {
    const vars = this.variableDefinitions
      .map((varDef) => `$${varDef.name}: ${varDef.type}`)
      .join(', ');
    const frags = this.fragments.map((f) => f.printed).join('\n');
    return `query ${docName}(${vars}) {\n${this.selections.join('\n')}\n}\n\n${frags}\n`;
  }

  getVariables(): Record<string, VarValue> {
    return this.variableValues;
  }
}
