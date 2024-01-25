// THIS IS A TEST CONFIG FILE FOR THE SPEC TESTS

const path = require('path');

const docusaurusPlugin = path.join(__dirname, 'dist');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'My Site',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  plugins: [
    [
      docusaurusPlugin,
      {
        tsconfig: './test/stubs/tsconfig.json',
        entryPoints: './test/stubs/src/*',
        out: './test/out/default',
        readme: 'none',
        hideGenerator: true,
        cleanOutputDir: true,
      },
    ],
    [
      docusaurusPlugin,
      {
        id: 'api-2',
        tsconfig: './test/stubs/tsconfig.json',
        entryPoints: './test/stubs/src/module-1.ts',
        out: './test/out/global-members',
        readme: 'none',
        hideGenerator: true,
        sidebar: { pretty: true },
      },
    ],
  ],
};

module.exports = config;
