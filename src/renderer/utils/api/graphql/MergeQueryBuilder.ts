import type { FragmentInfo } from './utils';

type VarValue = string | number | boolean;

export class MergeQueryBuilder {
  private selections: string[] = [];
  private variableDefinitions: string[] = [];
  private variableValues: Record<string, VarValue> = {};
  private fragments: FragmentInfo[] = [];

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

  buildQuery(docName = 'FetchMergedNotifications'): string {
    const vars = this.variableDefinitions.join(', ');
    const frags = this.fragments.map((f) => f.printed).join('\n');
    return `query ${docName}(${vars}) {\n${this.selections.join('\n')}\n}\n\n${frags}\n`;
  }

  getVariables(): Record<string, VarValue> {
    return this.variableValues;
  }
}
