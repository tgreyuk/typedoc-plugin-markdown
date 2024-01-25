import { consola } from 'consola';
import { prebuildKinds } from './prebuild-kinds.js';
import { prebuildResources } from './prebuild-resources.js';

main();

async function main() {
  await prebuildKinds();
  await prebuildResources();
  consola.success('[typedoc-plugin-markdown] Prebuild code complete');
}
