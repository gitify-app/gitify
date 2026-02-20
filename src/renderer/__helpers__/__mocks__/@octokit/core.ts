const MockOctokit = vi.fn().mockImplementation(() => ({
  request: vi.fn(),
  graphql: vi.fn(),
  paginate: {
    iterator: vi.fn(),
  },
}));

// biome-ignore lint/suspicious/noExplicitAny: Mock file
(MockOctokit as any).plugin = vi.fn((..._plugins: any[]) => MockOctokit);

export { MockOctokit as Octokit };
