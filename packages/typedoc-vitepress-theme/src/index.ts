import * as fs from 'fs';
import * as path from 'path';
import {
  Application,
  DeclarationOption,
  Options,
  OptionsReader,
} from 'typedoc';
import { MarkdownRendererEvent } from 'typedoc-plugin-markdown';
import { DEFAULT_SIDEBAR_OPTIONS } from './options.js';
import * as options from './options/declarations.js';
import presets from './options/presets.js';
import { getSidebar } from './sidebars/sidebars.js';
import { VitepressTheme } from './theme.js';

export function load(app: Application) {
  app.renderer.defineTheme('vitepress', VitepressTheme);

  Object.entries(options).forEach(([name, option]) => {
    app.options.addDeclaration({
      name,
      ...option,
    } as DeclarationOption);
  });

  app.options.addReader(
    new (class implements OptionsReader {
      name = 'vitepress-options';
      readonly order = 0;
      readonly supportsPackages = false;
      read(container: Options) {
        Object.entries(presets).forEach(([key, value]) => {
          container.setValue('theme', 'vitepress');
          container.setValue(key, value);
        });
      }
    })(),
  );

  app.renderer.postRenderAsyncJobs.push(
    async (output: MarkdownRendererEvent) => {
      const sidebarOptions = {
        ...DEFAULT_SIDEBAR_OPTIONS,
        ...app.options.getValue('sidebar'),
      };
      if (sidebarOptions.autoConfiguration) {
        const outDir = app.options.getValue('out');
        const sidebarPath = path.resolve(outDir, 'typedoc-sidebar.json');
        const basePath = path.relative(
          app.options.getValue('docsRoot'),
          outDir,
        );

        const sidebarJson = getSidebar(
          output.navigation,
          basePath,
          sidebarOptions,
        );
        fs.writeFileSync(
          sidebarPath,
          sidebarOptions.pretty
            ? JSON.stringify(sidebarJson, null, 2)
            : JSON.stringify(sidebarJson),
        );
      }
    },
  );
}
