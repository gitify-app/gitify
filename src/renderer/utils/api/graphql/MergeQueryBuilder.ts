import type { TypedDocumentString } from './generated/graphql';
import type { FragmentInfo } from './utils';
import {
  aliasRootAndKeyVariables,
  extractIndexedArguments,
  extractNonQueryFragments,
  extractQueryFragments,
} from './utils';

type VarValue = string | number | boolean;
type TypeMap = Record<string, string>;

export class MergeQueryBuilder {
  private selections: string[] = [];
  private variableDefinitions: string[] = [];
  private variableValues: Record<string, VarValue> = {};
  private fragments: FragmentInfo[] = [];

  private queryFragmentInner: string | null = null;
  private typeMap: TypeMap = {
    owner: 'String!',
    name: 'String!',
    number: 'Int!',
    isDiscussionNotification: 'Boolean!',
    isIssueNotification: 'Boolean!',
    isPullRequestNotification: 'Boolean!',
  };

  constructor(
    templateDoc?: TypedDocumentString<unknown, unknown>,
    options?: { typeMap?: TypeMap },
  ) {
    if (options?.typeMap) {
      this.typeMap = { ...this.typeMap, ...options.typeMap };
    }

    if (templateDoc) {
      this.fragments.push(...extractNonQueryFragments(templateDoc));

      const queryFrags = extractQueryFragments(templateDoc);
      this.queryFragmentInner = queryFrags.length ? queryFrags[0].inner : null;
    }
  }

  addSelection(selection: string): this {
    if (selection) {
      this.selections.push(selection);
    }
    return this;
  }

  addVariableDefs(defs: string): this {
    if (defs) {
      this.variableDefinitions.push(defs);
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

  addQueryNode(
    alias: string,
    index: number,
    values: Record<string, VarValue>,
  ): this {
    if (!this.queryFragmentInner) {
      return this;
    }

    const rootAlias = `${alias}${index}`;
    const selection = aliasRootAndKeyVariables(
      rootAlias,
      index,
      this.queryFragmentInner,
    );
    this.addSelection(selection);

    const indexedArgs = extractIndexedArguments(this.queryFragmentInner);
    const defs = indexedArgs
      .map((arg) => {
        const base = arg.replace(/INDEX$/, '');
        const type = this.typeMap[base] ?? 'String';
        return `$${base}${index}: ${type}`;
      })
      .join(', ');
    if (defs.length > 0) {
      this.addVariableDefs(defs);
    }

    for (const [base, val] of Object.entries(values)) {
      this.setVar(`${base}${index}`, val);
    }

    return this;
  }

  buildQuery(docName = 'FetchMergedNotifications'): string {
    const vars = this.variableDefinitions.join(', ');
    const frags = this.fragments.map((f) => f.printed).join('\n');
    return `query ${docName}(${vars}) {\n${this.selections.join('\n')}\n}\n\n${frags}\n`;
  }

  getVariables(): Record<string, VarValue> {
    return this.variableValues;
  }
}
