import { spawn } from 'child_process';
import { consola } from 'consola';
import fs from 'fs-extra';

const timeStart = new Date().getTime();

consola.start(`Building test fixtures...`);

// remove output dir
fs.removeSync(`./test/out`);

const fixtures = [
  { options: 'typedoc.base.json', outDir: 'default' },
  { options: 'typedoc.single-modules.json', outDir: 'single-modules' },
  { options: 'typedoc.single-page.json', outDir: 'single-page' },
  { options: 'typedoc.globals.json', outDir: 'globals' },
];

// write fixtures
fixtures.forEach((fixture) => {
  writeMarkdown(fixture);
});

function writeMarkdown(fixture: any) {
  spawn(
    'typedoc',
    [
      ...[
        '-options',
        `./test/${fixture.options}`,
        '-logLevel',
        'Warn',
        '-out',
        `./test/out/${fixture.outDir}`,
      ],
    ],
    {
      stdio: 'inherit',
    },
  );
}
process.on('exit', () => {
  consola.success(
    `Finished building fixtures in ${(
      (new Date().getTime() - timeStart) /
      1000
    ).toFixed(2)} seconds`,
  );
});
