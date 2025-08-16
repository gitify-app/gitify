// Mock implementation for Octokit to work with Jest
export class Octokit {
  auth?: string;
  baseUrl?: string;

  constructor(options?: { auth?: string; baseUrl?: string }) {
    this.auth = options?.auth;
    this.baseUrl = options?.baseUrl;
  }

  static plugin(...plugins: any[]) {
    return MockOctokit;
  }

  request = jest.fn().mockResolvedValue({ 
    data: {},
    status: 200,
    headers: {},
    url: 'mock-url'
  });

  graphql = jest.fn().mockResolvedValue({});
  
  paginate = jest.fn().mockResolvedValue([]);
}

class MockOctokit extends Octokit {
  constructor(options?: any) {
    super(options);
  }
}

export const paginateRest = {
  paginate: jest.fn().mockResolvedValue([]),
};

export default Octokit;