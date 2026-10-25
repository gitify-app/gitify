import { mergeHeaders } from './headers';

describe('renderer/utils/forges/headers.ts', () => {
  it('returns the base headers verbatim when there are no extra headers', () => {
    const base = { Authorization: 'token secret' };

    expect(mergeHeaders(base)).toBe(base);
  });

  it('merges an object of extra headers, keeping base keys', () => {
    expect(
      mergeHeaders({ Accept: 'application/json' }, { 'Content-Type': 'application/json' }),
    ).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  });

  it('normalises a Headers instance', () => {
    const extra = new Headers({ 'X-Test': 'yes' });

    expect(mergeHeaders({ Accept: 'application/json' }, extra)).toEqual({
      Accept: 'application/json',
      'X-Test': 'yes',
    });
  });

  it('normalises an entry array', () => {
    expect(
      mergeHeaders({ Accept: 'application/json' }, [
        ['X-Test', 'yes'],
        ['X-Other', 'no'],
      ]),
    ).toEqual({
      Accept: 'application/json',
      'X-Test': 'yes',
      'X-Other': 'no',
    });
  });

  it('lets extra headers override the base', () => {
    expect(mergeHeaders({ Accept: 'application/json' }, { Accept: 'text/plain' })).toEqual({
      Accept: 'text/plain',
    });
  });
});
