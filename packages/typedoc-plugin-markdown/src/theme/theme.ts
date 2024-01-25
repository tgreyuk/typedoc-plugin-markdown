import {
  DeclarationReflection,
  DefaultTheme,
  ProjectReflection,
  Reflection,
  ReflectionKind,
  Theme,
} from 'typedoc';
import { MarkdownPageEvent } from '../plugin/index.js';
import { OutputFileStrategy } from '../plugin/options/option-maps.js';
import { getNavigation } from './support/support.navigation.js';
import { RenderTemplate, getUrls } from './support/support.urls.js';
import { MarkdownThemeRenderContext } from './theme-render-context.js';

/**
 * This is in-built MarkdownTheme which extends TypeDocs Theme class.
 * This follows the implementation of TypeDoc's {@link DefaultTheme}.
 *
 */
export class MarkdownTheme extends Theme {
  /**
   * Renders a template and page model to a string.
   */
  render(
    page: MarkdownPageEvent<Reflection>,
    template: RenderTemplate<MarkdownPageEvent<Reflection>>,
  ) {
    try {
      return this.formatContents(template(page));
    } catch (e) {
      this.application.logger.error(
        `Error rendering page ${page.url} using template ${template.name}: ${e.message}`,
      );
      throw new Error(e);
    }
  }

  /**
   * Creates a instance of render context for each page template.
   */
  getRenderContext(page: MarkdownPageEvent<Reflection> | null) {
    return new MarkdownThemeRenderContext(this, page, this.application.options);
  }

  readmeTemplate = (page: MarkdownPageEvent<ProjectReflection>) => {
    return this.getRenderContext(page).templates.readmeTemplate(page);
  };

  projectTemplate = (page: MarkdownPageEvent<ProjectReflection>) => {
    return this.getRenderContext(page).templates.projectTemplate(page);
  };

  reflectionTemplate = (page: MarkdownPageEvent<DeclarationReflection>) => {
    return this.getRenderContext(page).templates.reflectionTemplate(page);
  };

  memberTemplate = (page: MarkdownPageEvent<DeclarationReflection>) => {
    return this.getRenderContext(page).templates.memberTemplate(page);
  };

  getUrls(project: ProjectReflection) {
    return getUrls(this, project);
  }

  getNavigation(project: ProjectReflection) {
    return getNavigation(this, project);
  }

  formatContents(contents: string) {
    return (
      contents.replace(/[\r\n]{3,}/g, '\n\n').replace(/^\s+|\s+$/g, '') + '\n'
    );
  }

  /**
   * Returns the template mapping for a given reflection kind
   * @param kind
   */
  getTemplateMapping(
    kind: ReflectionKind,
    outputFileStrategyOverride?: OutputFileStrategy,
  ) {
    const outputFileStrategy =
      outputFileStrategyOverride ||
      this.application.options.getValue('outputFileStrategy');

    const getDirectoryName = (reflectionKind: ReflectionKind) => {
      const pluralString = ReflectionKind.pluralString(reflectionKind);
      return pluralString.replace(/[\s_-]+/g, '-').toLowerCase();
    };

    const mappings = {
      [ReflectionKind.Module]: {
        template: this.reflectionTemplate,
        directory: null,
        kind: ReflectionKind.Module,
      },
      [ReflectionKind.Namespace]: {
        template: this.reflectionTemplate,
        directory: getDirectoryName(ReflectionKind.Namespace),
        kind: ReflectionKind.Namespace,
      },
    };

    const getMemberMapping = (
      template: (pageEvent: MarkdownPageEvent<any>) => string,
      kind: ReflectionKind,
    ) => {
      return {
        template,
        directory: getDirectoryName(kind),
        kind: kind,
      };
    };

    if (outputFileStrategy === OutputFileStrategy.Members) {
      mappings[ReflectionKind.Class] = getMemberMapping(
        this.reflectionTemplate,
        ReflectionKind.Class,
      );
    }
    if (outputFileStrategy === OutputFileStrategy.Members) {
      mappings[ReflectionKind.Interface] = getMemberMapping(
        this.reflectionTemplate,
        ReflectionKind.Interface,
      );
    }
    if (outputFileStrategy === OutputFileStrategy.Members) {
      mappings[ReflectionKind.Enum] = getMemberMapping(
        this.reflectionTemplate,
        ReflectionKind.Enum,
      );
    }
    if (outputFileStrategy === OutputFileStrategy.Members) {
      mappings[ReflectionKind.Function] = getMemberMapping(
        this.memberTemplate,
        ReflectionKind.Function,
      );
    }
    if (outputFileStrategy === OutputFileStrategy.Members) {
      mappings[ReflectionKind.TypeAlias] = getMemberMapping(
        this.memberTemplate,
        ReflectionKind.TypeAlias,
      );
    }
    if (outputFileStrategy === OutputFileStrategy.Members) {
      mappings[ReflectionKind.Variable] = getMemberMapping(
        this.memberTemplate,
        ReflectionKind.Variable,
      );
    }
    return mappings[kind];
  }
}
