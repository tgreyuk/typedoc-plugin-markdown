import * as path from 'path';
import { Fixture } from './models';

export enum FixtureOutputFileStrategy {
  Modules = 'modules',
  Members = 'members',
}

export enum FixtureEntryPoints {
  Reflections = '/src/reflections/index.ts',
  Packages = '/src/packages/*',
  Package = '/src/packages/package-1',
  Groups = '/src/groups/**/*.ts',
  Comments = '/src/comments/index.ts',
  EntryFiles = '/src/entryfiles/*',
  Readme = '/src/readme/index.ts',
  Text = '/src/text/*.ts',
  Customize = '/src/customize/index.ts',
}

export enum FixtureOutputDir {
  Reflections = 'reflections',
  Packages = 'packages',
  Package = 'package',
  Groups = 'groups',
  Comments = 'comments',
  EntryFiles = 'entryfiles',
  Readme = 'readme',
  Text = 'text',
  Customize = 'customize',
}

export const FIXTURES: Fixture[] = [
  {
    outDir: FixtureOutputDir.Reflections,
    entryPoints: FixtureEntryPoints.Reflections,
    commonOptions: {
      hideGenerator: true,
      hidePageHeader: true,
      hideBreadcrumbs: true,
    },
    options: [
      { hideParameterTypesInTitle: false },
      {
        readme: 'none',
        parametersFormat: 'table',
        propertiesFormat: 'table',
        typeDeclarationFormat: 'table',
        enumMembersFormat: 'table',
        useCodeBlocks: true,
        expandObjects: true,
        memberPageTitle: '{name}',
        hideParameterTypesInTitle: true,
      },
    ],
  },
  {
    outDir: FixtureOutputDir.Groups,
    entryPoints: FixtureEntryPoints.Groups,
    commonOptions: {
      disableSources: true,
      hideGenerator: true,
      entryFileName: 'index.md',
    },
    options: [
      {
        categorizeByGroup: true,
      },
      {
        readme: 'none',
        categorizeByGroup: false,
        excludeGroups: true,
        namedAnchors: true,
        indexFormat: 'table',
        indexPageTitle: '{projectName}',
      },
    ],
  },
  {
    outDir: FixtureOutputDir.Comments,
    entryPoints: FixtureEntryPoints.Comments,
    commonOptions: {
      disableSources: true,
      hidePageHeader: true,
      hideBreadcrumbs: true,
      hideGenerator: true,
      enumMembersFormat: 'table',
      propertiesFormat: 'table',
      readme: 'none',
      media: '../../stubs/media',
      includes: '../../stubs/inc',
    },
    options: [
      {},
      {
        namedAnchors: true,
        preserveAnchorCasing: true,
      },
    ],
  },
  {
    outDir: FixtureOutputDir.Packages,
    entryPoints: FixtureEntryPoints.Packages,
    commonOptions: {
      entryPointStrategy: 'packages',
      hideGenerator: true,
      name: 'packages-example',
      entryFileName: 'index.md',
      disableSources: true,
    },
    options: [
      {},
      { mergeReadme: true, includeVersion: true, indexPageTitle: 'API' },
    ],
  },
  {
    outDir: FixtureOutputDir.Package,
    entryPoints: FixtureEntryPoints.Package,
    commonOptions: {
      entryPointStrategy: 'packages',
      hideGenerator: true,
      name: 'packages-example',
      includeVersion: true,
      disableSources: true,
    },
    options: [{}],
  },
  {
    outDir: FixtureOutputDir.EntryFiles,
    entryPoints: FixtureEntryPoints.EntryFiles,
    commonOptions: {
      entryFileName: 'index.md',
      entryModule: 'entry-module',
      hideGenerator: true,
      disableSources: true,
    },
    options: [{ entryFileName: 'README.md' }, { readme: 'none' }],
  },
  {
    outDir: FixtureOutputDir.Readme,
    entryPoints: FixtureEntryPoints.Readme,
    commonOptions: {},
    options: [
      {
        entryFileName: 'index.md',
        disableSources: true,
        hideGenerator: true,
        mergeReadme: true,
      },
    ],
  },
  {
    outDir: FixtureOutputDir.Text,
    entryPoints: FixtureEntryPoints.Text,
    commonOptions: { disableSources: true },
    options: [
      {
        includeVersion: true,
        titleLink: 'http://www.google.com',
        options: '../../stubs/typedoc.text.cjs',
        propertiesFormat: 'table',
      },
    ],
  },
  {
    outDir: FixtureOutputDir.Customize,
    entryPoints: FixtureEntryPoints.Customize,
    commonOptions: {
      disableSources: true,
      hideGenerator: true,
      readme: 'none',
      outputFileStrategy: 'modules',
    },
    membersOnly: true,
    options: [
      {
        plugin: [
          path.join(
            path.resolve(),
            'test',
            'custom-plugins',
            'custom-theme.mjs',
          ),
        ],
        theme: 'custom-theme',
      },
    ],
  },
];
