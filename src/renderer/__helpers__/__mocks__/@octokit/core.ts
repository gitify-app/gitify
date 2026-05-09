const MockOctokit = vi.fn().mockImplementation(() => ({
  request: vi.fn(),
  graphql: vi.fn(),
  paginate: {
    iterator: vi.fn(),
  },
}));

// oxlint-disable-next-line typescript/no-explicit-any -- Mock file
(MockOctokit as any).plugin = vi.fn((..._plugins: any[]) => MockOctokit);

export { MockOctokit as Octokit };
