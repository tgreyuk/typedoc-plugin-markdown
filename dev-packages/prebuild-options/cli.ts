#!/usr/bin/env ts-node-esm

import { DOCS_CONFIG, DocsConfig, getPackageName } from '@dev-packages/helpers';
import { consola } from 'consola';
import { generateDocs } from './tasks/generate-docs.js';
import { generateModels } from './tasks/generate-models.js';

main();

async function main() {
  const docsConfig: DocsConfig = DOCS_CONFIG[getPackageName()];
  if (docsConfig.declarations) {
    await generateModels(docsConfig.declarationsPath);
  }
  await generateDocs(docsConfig);
  consola.success(`[${getPackageName()}] Prebuild options complete`);
}
