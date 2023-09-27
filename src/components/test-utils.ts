const originalMathRandom = Math.random;

export const mockMathRandom = (mockValue: number) => {
  beforeEach(() => {
    global.Math.random = jest.fn(() => mockValue);
  });

  afterEach(() => {
    global.Math.random = originalMathRandom;
  });
};
