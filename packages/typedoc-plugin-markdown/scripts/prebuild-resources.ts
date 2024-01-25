import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';
import { Project } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

const resourcesPath = path.join(path.resolve(), 'src', 'theme', 'resources');

export async function prebuildResources() {
  writeBarrelsFile('partials');
  writeBarrelsFile('templates');
  writeResourcesFile();
}

function getFiles(type: string) {
  const partialsFolder = path.join(resourcesPath, type);
  return fs
    .readdirSync(partialsFolder)
    .map((partialsFile) => path.parse(partialsFile).name);
}

function getSymbols(files: string[], type: string) {
  return files.map((file) => {
    const tsFile = project.getSourceFile(
      path.join(resourcesPath, type, file + '.ts'),
    );
    const symbolName = tsFile?.getExportSymbols()[0]?.getEscapedName();
    return { symbolName };
  });
}

function writeBarrelsFile(resourceType: 'partials' | 'templates') {
  const files = getFiles(resourceType).filter((file) => file !== 'index');
  const symbols = getSymbols(files, resourceType);
  const barrelsFile = path.join(
    path.resolve(),
    'src',
    'theme',
    'resources',
    resourceType,
    'index.ts',
  );
  const out: string[] = [];
  files.forEach((file, index) => {
    out.push(`export { ${symbols[index].symbolName} } from './${file}.js';`);
  });
  fs.writeFileSync(barrelsFile, out.join('\n'));
}

async function writeResourcesFile() {
  const resourcesFile = path.join(
    path.resolve(),
    'src',
    'theme',
    'resources',
    'index.ts',
  );

  const out = `
import { MarkdownThemeRenderContext } from '../..';
${getResourceImports('templates')}
${getResourceImports('partials')}
function bind<F, L extends any[], R>(fn: (f: F, ...a: L) => R, first: F) {
  return (...args: L) => fn(first, ...args);
}
${getResourceBinding('templates')}
${getResourceBinding('partials')}
`;
  const formattedOut = await prettier.format(out, {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
  });
  fs.writeFileSync(resourcesFile, formattedOut);
}

function getResourceImports(resourceType: 'partials' | 'templates') {
  const files = getFiles(resourceType).filter((file) => file !== 'index');
  const symbols = getSymbols(files, resourceType);
  return `
  import { ${symbols
    .map((symbol) => symbol.symbolName)
    .join(', ')} } from './${resourceType}/index.js';
 `;
}

function getResourceBinding(resourceType: 'partials' | 'templates') {
  const files = getFiles(resourceType).filter((file) => file !== 'index');
  const symbols = getSymbols(files, resourceType);
  return `
  export const ${resourceType} = (context: MarkdownThemeRenderContext) => {
    return {
      ${symbols.map(
        (symbol) => `${symbol.symbolName}: bind(${symbol.symbolName},context)`,
      )}
    };
  };`;
}
