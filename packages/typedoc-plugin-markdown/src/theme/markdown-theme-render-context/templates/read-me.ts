import { MarkdownThemeRenderContext } from '@plugin/theme';
import { CommentDisplayPart, ProjectReflection } from 'typedoc';

/**
 * Template that specifically maps to the resolved readme file. This template is not used when 'readme' is set to 'none'.
 */
export function readme(
  this: MarkdownThemeRenderContext,
  model: ProjectReflection,
) {
  const md: string[] = [];

  if (!this.options.getValue('hidePageHeader')) {
    md.push(this.partials.header());
  }

  if (!this.options.getValue('hideBreadcrumbs')) {
    md.push(this.partials.breadcrumbs());
  }

  if (Boolean(model.readme)) {
    md.push(this.partials.commentParts(model.readme as CommentDisplayPart[]));
  }

  return md.join('\n\n');
}