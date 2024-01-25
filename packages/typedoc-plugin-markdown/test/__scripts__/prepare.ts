import { spawn } from 'child_process';
import { consola } from 'consola';
import fs from 'fs-extra';
import * as path from 'path';
import {
  FIXTURES,
  FixtureEntryPoints,
  FixtureOutputDir,
  FixtureOutputFileStrategy,
} from '../__utils__/fixture-config.js';
import { Fixture } from '../__utils__/models.js';

const timeStart = new Date().getTime();

const only: FixtureOutputDir[] = [];

const fixturesToRun = FIXTURES.filter((fixture) => {
  if (only.length) {
    return only.includes(fixture.outDir);
  }
  return true;
});

const fixtureCount = fixturesToRun.reduce(
  (prev, curr) => prev + curr.options.length * (curr.membersOnly ? 1 : 2),
  0,
);

consola.start(`Building ${fixtureCount} test fixtures...`);

// remove output dir
fs.removeSync(`./test/out`);

// write fixtures
fixturesToRun.forEach((fixture) => {
  writeHtml(fixture.entryPoints, fixture.outDir);
  const fileStrategies = fixture.membersOnly
    ? [FixtureOutputFileStrategy.Members]
    : [FixtureOutputFileStrategy.Members, FixtureOutputFileStrategy.Modules];

  fileStrategies.forEach((outputFileStrategy) => {
    fixture.options.forEach((optionGroup, index) => {
      writeMarkdown(
        fixture,
        outputFileStrategy,
        optionGroup,
        'opts-' + Number(index + 1),
      );
    });
  });
});

function writeMarkdown(
  fixture: Fixture,
  outputFileStrategy: string,
  optionGroup: any,
  optionDir: string,
) {
  const { outDir, entryPoints } = fixture;
  const fullPath = path.join(outDir, outputFileStrategy, optionDir);
  const options = {
    outputFileStrategy,
    ...fixture.commonOptions,
    ...optionGroup,
  };

  spawn(
    'typedoc',
    [
      ...[
        '-options',
        `../../stubs/typedoc.cjs`,
        '-logLevel',
        'Warn',
        '-entryPoints',
        [`../../stubs/${entryPoints}`],
        '-out',
        `./test/out/${fullPath}`,
      ],
      ...objectToOptions(options),
    ],
    {
      stdio: 'inherit',
    },
  );
}

export function writeHtml(
  entryPoints: FixtureEntryPoints,
  outDir: FixtureOutputDir,
) {
  const fullpath = `./test/out/html/${outDir}`;
  spawn(
    'typedoc',
    [
      ...[
        '-options',
        `../../stubs/typedoc.cjs`,
        '-logLevel',
        'Warn',
        '--readme',
        'none',
        '--media',
        '../../stubs/media',
        '--includes',
        '../../stubs/inc',
        '--includeVersion',
        '-entryPoints',
        `../../stubs/${entryPoints}`,
        '-out',
        fullpath,
      ],
    ],
    {
      stdio: 'inherit',
    },
  );
}

function objectToOptions(obj: any) {
  return Object.entries(obj).reduce(
    (prev: any, curr: any) => {
      if (Array.isArray(curr[1])) {
        return [
          ...prev,
          ...curr[1].reduce((prev1, curr1) => {
            return [...prev1, ...[`-${curr[0]}`, curr1]];
          }, []),
        ];
      }
      if (typeof curr[1] === 'object') {
        return [
          ...prev,
          ...Object.entries(curr[1]).reduce((prev1: any, curr1: any) => {
            return [...prev1, ...[`-${curr[0]}.${curr1[0]}`, true]];
          }, []),
        ];
      }
      return [...prev, ...[`-${curr[0]}`, curr[1]]];
    },
    [
      '-plugin',
      'typedoc-plugin-markdown',
      '-plugin',
      path.join(
        path.resolve(),
        'test',
        'custom-plugins',
        'navigation-plugin.mjs',
      ),
    ],
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
