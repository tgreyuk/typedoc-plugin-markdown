import { spawn } from 'child_process';
import { consola } from 'consola';
import fs from 'fs-extra';

const timeStart = new Date().getTime();

consola.start(`Building test fixtures...`);

fs.removeSync(`./test/out`);

const fixtures = [
  { options: 'typedoc-options.json', outDir: 'options' },
  { options: 'typedoc-options-2.json', outDir: 'options-2' },
  { options: 'typedoc-base.json', outDir: 'no-data' },
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
