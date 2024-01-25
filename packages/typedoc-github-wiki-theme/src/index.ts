import * as fs from 'fs';
import {
  Application,
  DeclarationOption,
  Options,
  OptionsReader,
} from 'typedoc';
import {
  MarkdownRendererEvent,
  NavigationItem,
  OutputFileStrategy,
} from 'typedoc-plugin-markdown';
import { DEFAULT_SIDEBAR_OPTIONS } from './options.js';
import * as options from './options/declarations.js';
import presets from './options/presets.js';
import { GithubWikiTheme } from './theme.js';

export function load(app: Application) {
  app.renderer.defineTheme('github-wiki', GithubWikiTheme);

  Object.entries(options).forEach(([name, option]) => {
    app.options.addDeclaration({
      name,
      ...option,
    } as DeclarationOption);
  });

  app.options.addReader(
    new (class implements OptionsReader {
      name = 'github-wiki-options';
      readonly order = 0;
      readonly supportsPackages = false;
      read(container: Options) {
        Object.entries(presets).forEach(([key, value]) => {
          container.setValue('theme', 'github-wiki');
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
        const sidebarHeading = sidebarOptions.heading;
        const sidebarContent = getSidebar(
          output.navigation,
          app.options.getValue('outputFileStrategy'),
        );
        if (sidebarContent.length) {
          fs.writeFileSync(
            `${output.outputDirectory}/_Sidebar.md`,
            `## ${sidebarHeading}\n\n${formatContents(
              getSidebar(
                output.navigation,
                app.options.getValue('outputFileStrategy'),
              ),
            )}`,
          );
        }
      }
    },
  );
}

export function getSidebar(
  navigationItems: NavigationItem[],
  outputFileStrategy: OutputFileStrategy,
) {
  const parseUrl = (url: string) => '../wiki/' + url.replace('.md', '');
  const md: string[] = [];
  const isGlobals = navigationItems?.every((child) => !Boolean(child.url));

  if (isGlobals) {
    navigationItems.forEach((navigationItem) => {
      md.push(`### ${navigationItem.title}`);
      if (navigationItem.children) {
        const childList = navigationItem.children
          ?.map((child) => `- [${child.title}](${parseUrl(child.url || '')})`)
          .join('\n');
        md.push(childList);
      }
    });
  } else {
    if (outputFileStrategy === OutputFileStrategy.Members) {
      navigationItems.forEach((navigationItem, i) => {
        md.push(`### ${navigationItem.title}`);
        if (navigationItem.children) {
          navigationItem.children.forEach((child) => {
            md.push(`#### ${child.title}`);
            if (child.children) {
              const childList = child.children
                ?.map(
                  (innerChild) =>
                    `- [${innerChild.title}](${
                      innerChild.url ? parseUrl(innerChild.url) : ''
                    })`,
                )
                .join('\n');
              md.push(childList);
            }
          });
        }
      });
    } else {
      const childList = navigationItems
        ?.map(
          (navItem) =>
            `- [${navItem.title}](${navItem.url ? parseUrl(navItem.url) : ''})`,
        )
        .join('\n');
      md.push(childList);
    }
  }
  return md.join('\n\n');
}

function formatContents(contents: string) {
  return (
    contents.replace(/[\r\n]{3,}/g, '\n\n').replace(/^\s+|\s+$/g, '') + '\n'
  );
}
