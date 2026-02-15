const MockOctokit = vi.fn().mockImplementation(() => ({
  request: jest.fn(),
  graphql: jest.fn(),
  paginate: {
    iterator: jest.fn(),
  },
}));

// biome-ignore lint/suspicious/noExplicitAny: Mock file
(MockOctokit as any).plugin = vi.fn((..._plugins: any[]) => MockOctokit);

export { MockOctokit as Octokit };
