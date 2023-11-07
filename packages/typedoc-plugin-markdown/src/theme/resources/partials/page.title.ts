import {
  DeclarationReflection,
  ProjectReflection,
  ReflectionKind,
} from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';
import { MarkdownPageEvent } from '../../../plugin/events';

import { getMemberTitle, getProjectDisplayName } from '../../helpers';

/**
 * @category Partials
 */
export function pageTitle(
  context: MarkdownThemeRenderContext,
  page: MarkdownPageEvent<DeclarationReflection | ProjectReflection>,
): string {
  const memberPageTitle = context.options.getValue('memberPageTitle') as string;
  const name = getMemberTitle(page.model as DeclarationReflection);
  const projectName = getProjectDisplayName(
    page.project,
    context.options.getValue('includeVersion'),
  );

  if (page.model?.url === page.project.url) {
    return context.options
      .getValue('indexPageTitle')
      .replace('{projectName}', projectName);
  }

  if (page.model.kindOf(ReflectionKind.Module)) {
    return name;
  }

  return memberPageTitle
    .replace('{name}', name)
    .replace('{kind}', ReflectionKind.singularString(page.model.kind));
}