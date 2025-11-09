module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        // Ensure ESM in node_modules is converted to CommonJS for Jest
        modules: 'commonjs',
      },
    ],
  ],
};
