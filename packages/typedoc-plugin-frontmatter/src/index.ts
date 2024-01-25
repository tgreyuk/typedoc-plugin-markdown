import {
  Application,
  DeclarationOption,
  DeclarationReflection,
  ProjectReflection,
} from 'typedoc';
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';
import * as yaml from 'yaml';
import * as options from './options/declarations.js';
import { getFrontmatterTags } from './tags.js';

export function load(app: Application) {
  Object.entries(options).forEach(([name, option]) => {
    app.options.addDeclaration({
      name,
      ...option,
    } as DeclarationOption);
  });

  app.renderer.on(
    MarkdownPageEvent.BEGIN,
    (page: MarkdownPageEvent<ProjectReflection | DeclarationReflection>) => {
      const frontmatterGlobals = app.options.getValue(
        'frontmatterGlobals',
      ) as any;

      const frontmatterTags = app.options.getValue('frontmatterCommentTags');

      const namingConvention = app.options.getValue(
        'frontmatterNamingConvention',
      );

      const preserveFrontmatterCommentTags = app.options.getValue(
        'preserveFrontmatterCommentTags',
      );

      const resolvedFrontmatterTags = page.model?.comment
        ? getFrontmatterTags(
            page.model?.comment,
            frontmatterTags,
            namingConvention,
          )
        : {};

      if (
        Object.keys(resolvedFrontmatterTags)?.length &&
        !preserveFrontmatterCommentTags
      ) {
        Object.keys(resolvedFrontmatterTags).forEach((tag) => {
          page.model?.comment?.removeTags(`@${tag}`);
        });
      }

      page.frontmatter = {
        ...(page.frontmatter || {}),
        ...frontmatterGlobals,
        ...resolvedFrontmatterTags,
      };
    },
  );

  app.renderer.on(
    MarkdownPageEvent.END,
    (page: MarkdownPageEvent<ProjectReflection | DeclarationReflection>) => {
      if (Object.keys(page.frontmatter)?.length) {
        page.contents = page?.contents
          ?.replace(/^/, `---\n${yaml.stringify(page.frontmatter)}---\n\n`)
          .replace(/[\r\n]{3,}/g, '\n\n');
      }
    },
  );
}
