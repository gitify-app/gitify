const MockOctokit = jest.fn().mockImplementation(() => ({
  request: jest.fn(),
  graphql: jest.fn(),
  paginate: {
    iterator: jest.fn(),
  },
}));

// biome-ignore lint/suspicious/noExplicitAny: Mock file
(MockOctokit as any).plugin = jest.fn((..._plugins: any[]) => MockOctokit);

export { MockOctokit as Octokit };
