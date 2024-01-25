const base = require('../../jest.config.base.cjs');

module.exports = {
  ...base,
  displayName: 'typedoc-plugin-markdown',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  setupFiles: ['./jest.helpers.ts'],
};
