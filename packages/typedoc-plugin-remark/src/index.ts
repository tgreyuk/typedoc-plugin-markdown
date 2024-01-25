import {
  Application,
  DeclarationOption,
  DeclarationReflection,
  ReflectionKind,
  RendererEvent,
} from 'typedoc';
import { MarkdownPageEvent, OutputFileStrategy } from 'typedoc-plugin-markdown';
import * as options from './options/declarations.js';
import { parseContents } from './remark.js';

export function load(app: Application) {
  Object.entries(options).forEach(([name, option]) => {
    app.options.addDeclaration({
      name,
      ...option,
    } as DeclarationOption);
  });

  app.renderer.on(MarkdownPageEvent.END, (event: MarkdownPageEvent) => {
    const remarkPlugins = app.options.getValue('remarkPlugins') as [];
    const remarkPluginsNames = remarkPlugins.map((plugin) =>
      Array.isArray(plugin) ? plugin[0] : plugin,
    ) as string[];

    if (remarkPluginsNames.includes('remark-toc')) {
      const tocPluginIndex = remarkPluginsNames.findIndex(
        (name) => name === 'remark-toc',
      );
      const tocPlugin = remarkPlugins[tocPluginIndex];
      const options = Array.isArray(tocPlugin) ? tocPlugin[1] : {};

      const isModulesOnly = (
        event?.model as DeclarationReflection
      ).children?.every((child) => child.kindOf(ReflectionKind.Module));
      const outputFileStrategy = app.options.getValue('outputFileStrategy');

      const kindsWithToc = [
        ReflectionKind.Namespace,
        ReflectionKind.Class,
        ReflectionKind.Enum,
        ReflectionKind.Interface,
      ];

      if (outputFileStrategy === OutputFileStrategy.Modules) {
        kindsWithToc.push(ReflectionKind.Module);
      }

      if (!isModulesOnly) {
        kindsWithToc.push(ReflectionKind.Project);
      }

      if (kindsWithToc.includes(event.model?.kind)) {
        const contents = event.contents;
        const contentToLines = contents?.split('\n');
        const firstHeadingIndex = contentToLines?.findIndex((line) =>
          line.startsWith('##'),
        );
        if (firstHeadingIndex && firstHeadingIndex > 0) {
          contentToLines?.splice(
            firstHeadingIndex,
            0,
            `\n\n## ${(options as any)?.heading || 'Contents'}\n\n`,
          );
          event.contents = contentToLines?.join('\n');
        }
      }
    }
  });

  app.renderer.postRenderAsyncJobs.push(async (output: RendererEvent) => {
    const remarkPlugins = app.options.getValue('remarkPlugins') as any;
    if (output.urls?.length) {
      await Promise.all(
        output.urls?.map(async (urlMapping) => {
          const filePath = `${output.outputDirectory}/${urlMapping.url}`;
          return await parseContents(filePath, remarkPlugins);
        }),
      );
      if (remarkPlugins.length) {
        app.logger.info(
          `Output parsed using remark plugin(s) [${remarkPlugins
            .map((plugin) => `"${Array.isArray(plugin) ? plugin[0] : plugin}"`)
            .join(', ')}]`,
        );
      }
    }
  });
}
