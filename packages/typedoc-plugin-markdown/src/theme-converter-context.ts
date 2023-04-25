import {
  DeclarationReflection,
  Options,
  PageEvent,
  ProjectReflection,
  Reflection,
  ReflectionGroup,
  ReflectionKind,
  UrlMapping,
} from 'typedoc';
import {
  NavigationItem,
  TemplateMapping,
  TypedocPluginMarkdownOptions,
} from './models';
import { slugify } from './support/utils';
import { MarkdownTheme } from './theme';

export class MarkdownThemeConverterContext {
  private _urls: UrlMapping[];
  private _anchors: Record<string, string[]> = {};

  constructor(public theme: MarkdownTheme, public options: Options) {}

  getOption<K extends keyof TypedocPluginMarkdownOptions>(name: K) {
    return this.options.getValue(name) as TypedocPluginMarkdownOptions[K];
  }

  readmeTemplate = (pageEvent: PageEvent<ProjectReflection>) => {
    return this.theme.getRenderContext().templates.readmeTemplate(pageEvent);
  };

  projectTemplate = (pageEvent: PageEvent<ProjectReflection>) => {
    return this.theme.getRenderContext().templates.projectTemplate(pageEvent);
  };

  reflectionTemplate = (pageEvent: PageEvent<DeclarationReflection>) => {
    return this.theme
      .getRenderContext()
      .templates.reflectionTemplate(pageEvent);
  };

  memberTemplate = (pageEvent: PageEvent<DeclarationReflection>) => {
    return this.theme.getRenderContext().templates.memberTemplate(pageEvent);
  };

  getUrls(project: ProjectReflection): UrlMapping[] {
    if (!this._urls) {
      const readme = this.getOption('readme') as string;
      const entryDocument = this.getOption('entryDocument') as string;
      const noReadmeFile = readme.endsWith('none');
      const modulesFile = 'modules.md';

      this._urls = [];

      if (noReadmeFile) {
        project.url = entryDocument;
        this._urls.push(
          new UrlMapping(entryDocument, project, this.projectTemplate),
        );
      } else {
        project.url = modulesFile;
        this._urls.push(
          new UrlMapping(entryDocument, project, this.readmeTemplate),
        );
        this._urls.push(
          new UrlMapping(
            `${
              this.getOption('numberPrefixOutput') ? '01-' : ''
            }${modulesFile}`,
            project,
            this.projectTemplate,
          ),
        );
      }
      project.groups?.forEach((projectGroup, groupIndex) => {
        projectGroup.children.forEach((child) => {
          const index = noReadmeFile ? groupIndex : groupIndex + 1;
          this.buildUrls(child, index, projectGroup);
        });
      });
    }
    return this._urls;
  }

  getNavigation(project: ProjectReflection) {
    const urls = this.getUrls(project);

    const navigation: NavigationItem[] = [];

    const onlyModules = project.children?.every((child) =>
      child.kindOf(ReflectionKind.Module),
    );

    if (onlyModules) {
      urls
        .filter(
          (urlMapping) =>
            urlMapping.model?.kindOf &&
            urlMapping.model.kindOf(ReflectionKind.Module),
        )
        .forEach((urlMapping) => {
          const children = this.getNavigationGroups(urls, urlMapping.url);
          navigation.push({
            title: urlMapping.model?.name,
            url: urlMapping.url,
            ...(children?.length && { children }),
          });
        });
    } else {
      this.getNavigationGroups(urls).forEach((group) => {
        navigation.push(group);
      });
    }
    return navigation;
  }

  private getNavigationGroups(urls: UrlMapping[], url = '') {
    const groups = urls?.filter((urlMapping) => {
      const baseParts = url?.split('/').slice(0, -1);
      const urlParts = urlMapping.url.split('/');
      return (
        urlMapping.model instanceof ReflectionGroup &&
        urlParts?.length === baseParts.length + 1 &&
        urlMapping.url.startsWith(baseParts.join('/'))
      );
    });

    return groups?.map((group) => ({
      title: group.model?.title,
      children: group?.model.children.map((child) => {
        const children = this.getNavigationGroups(urls, child.url as string);
        return {
          title: child.name,
          url: child.url || null,
          ...(children?.length && { children }),
        };
      }),
    }));
  }

  private buildUrls(
    reflection: DeclarationReflection,
    index: number,
    reflectionGroup: ReflectionGroup,
  ) {
    const mapping = this.mappings[reflection.kind];
    if (mapping) {
      const url = this.getUrl(reflection, mapping, index);
      if (mapping.directory) {
        if (!reflection.kindOf(ReflectionKind.Module)) {
          const sliceLength = reflection.kindOf(ReflectionKind.Namespace)
            ? -2
            : -1;
          const groupDirectory = url.split('/').slice(0, sliceLength).join('/');
          if (
            this._urls.findIndex(
              (urlMapping) => urlMapping.url === groupDirectory,
            ) === -1 &&
            groupDirectory.endsWith(mapping.directory)
          ) {
            this._urls.push(
              new UrlMapping(groupDirectory, reflectionGroup, () => ''),
            );
          }
        }
      }
      this._urls.push(new UrlMapping(url, reflection, mapping.template));
      reflection.url = url;
      reflection.hasOwnDocument = true;
      reflection.groups?.forEach((reflectionGroup, groupIndex) => {
        reflectionGroup.children.forEach((child) => {
          if (mapping.isLeaf) {
            this.applyAnchorUrl(child, reflection);
          } else {
            this.buildUrls(child, groupIndex, reflectionGroup);
          }
        });
      });
    } else if (reflection.parent) {
      this.applyAnchorUrl(reflection, reflection.parent);
    }
  }

  private getUrl(
    reflection: DeclarationReflection,
    mapping: TemplateMapping,
    index: number,
  ) {
    const alias = reflection.getFriendlyFullName().replace(/\//g, '_');

    if (this.getOption('flattenOutputFiles')) {
      return alias + '.md';
    }

    const childrenIncludeNamespaces =
      this.childrenIncludeNamespaces(reflection);

    const isModuleOrNamespace = reflection.kindOf([
      ReflectionKind.Module,
      ReflectionKind.Namespace,
    ]);

    const parts = alias.split('.');

    const namespaces: string[] = this.getNamespaces(reflection);

    if (
      mapping.directory &&
      !isModuleOrNamespace &&
      this.options.getValue('groupByKinds')
    ) {
      parts.splice(
        parts.length - 1,
        0,
        `${this.getOption('numberPrefixOutput') ? `0${index + 1}-` : ''}${
          mapping.directory
        }`,
      );
    }

    if (
      (this.getOption('kindsWithOwnFile')[0].toLowerCase() !== 'none' &&
        isModuleOrNamespace) ||
      childrenIncludeNamespaces
    ) {
      parts.push(`${parts[parts.length - 1]}`);
    }

    if (namespaces.length > 0) {
      namespaces.forEach((namespaceName) => {
        const namespaceIndex = parts.findIndex(
          (part) => part === namespaceName,
        );

        parts[namespaceIndex] = `${this.getAliasPrefix(
          ReflectionKind.Namespace,
        )}.${parts[namespaceIndex]}`;

        parts.splice(
          namespaceIndex,
          0,
          `${this.getOption('numberPrefixOutput') ? '01-' : ''}${
            this.mappings[ReflectionKind.Namespace].directory
          }` as string,
        );
      });
    }

    parts[parts.length - 1] = `${this.getAliasPrefix(reflection.kind)}.${
      parts[parts.length - 1]
    }`;

    if (parts.length > 1 && this.getOption('entryPoints')?.length > 1) {
      parts[0] = `${this.getAliasPrefix(ReflectionKind.Module)}.${parts[0]}`;
    }

    return parts.join('/') + '.md';
  }

  private childrenIncludeNamespaces(reflection: DeclarationReflection) {
    return reflection.children?.some((child) =>
      child.kindOf(ReflectionKind.Namespace),
    );
  }

  private getAliasPrefix(reflectionKind: ReflectionKind) {
    return slugify(ReflectionKind.singularString(reflectionKind));
  }

  private getNamespaces(
    reflection: DeclarationReflection,
    namespaces: string[] = [],
  ) {
    if (reflection?.kindOf(ReflectionKind.Namespace)) {
      namespaces.push(reflection.name);
    }
    if (reflection.parent?.kindOf(ReflectionKind.Namespace)) {
      this.getNamespaces(reflection?.parent as any, namespaces);
    }
    return namespaces;
  }

  private applyAnchorUrl(
    reflection: DeclarationReflection,
    container: Reflection,
  ) {
    if (container.url && !reflection.url) {
      if (!reflection.kindOf(ReflectionKind.TypeLiteral)) {
        const anchorId = this.getAnchorId(reflection);

        const count = this._anchors[container.url]?.filter(
          (id) => id === anchorId,
        )?.length;

        const anchor =
          anchorId + (count > 1 ? '-' + (count - 1).toString() : '');

        reflection.url = container.url + '#' + anchor;
        reflection.anchor = anchor;
      }
      reflection.hasOwnDocument = false;
    }
    reflection.traverse((child) => {
      if (child instanceof DeclarationReflection) {
        this.applyAnchorUrl(child, container);
      }
    });
  }

  private getAnchorId(reflection: DeclarationReflection) {
    const anchorFormat = this.getOption('anchorFormat');
    if (anchorFormat.toLowerCase() === 'lowercase') {
      return reflection.name.toLowerCase();
    }
    if (anchorFormat.toLowerCase() === 'slug') {
      return slugify(reflection.name);
    }
    return reflection.name;
  }

  get mappings(): Record<number, TemplateMapping> {
    const kindsWithOwnFileOption = this.options.getValue('kindsWithOwnFile') as
      | string
      | string[];
    const kindsWithOwnFile: string[] = Array.isArray(kindsWithOwnFileOption)
      ? kindsWithOwnFileOption.map((val) => val.toLowerCase())
      : [kindsWithOwnFileOption.toLowerCase()];

    const isAll = kindsWithOwnFile.includes('all');

    const mappings = {
      [ReflectionKind.Module]: {
        isLeaf: false,
        template: this.reflectionTemplate,
        directory: null,
        kind: ReflectionKind.Module,
      },
      [ReflectionKind.Namespace]: {
        isLeaf: false,
        template: this.reflectionTemplate,
        directory: 'namespaces',
        kind: ReflectionKind.Namespace,
      },
    };

    if (isAll || kindsWithOwnFile.includes('class')) {
      mappings[ReflectionKind.Class] = {
        isLeaf: false,
        template: this.reflectionTemplate,
        directory: 'classes',
        kind: ReflectionKind.Class,
      };
    }
    if (isAll || kindsWithOwnFile.includes('interface')) {
      mappings[ReflectionKind.Interface] = {
        isLeaf: false,
        template: this.reflectionTemplate,
        directory: 'interfaces',
        kind: ReflectionKind.Interface,
      };
    }
    if (isAll || kindsWithOwnFile.includes('enum')) {
      mappings[ReflectionKind.Enum] = {
        isLeaf: false,
        template: this.reflectionTemplate,
        directory: 'enums',
        kind: ReflectionKind.Enum,
      };
    }
    if (isAll || kindsWithOwnFile.includes('function')) {
      mappings[ReflectionKind.Function] = {
        isLeaf: true,
        template: this.memberTemplate,
        directory: 'functions',
        kind: ReflectionKind.Function,
      };
    }
    if (isAll || kindsWithOwnFile.includes('typealias')) {
      mappings[ReflectionKind.TypeAlias] = {
        isLeaf: true,
        template: this.memberTemplate,
        directory: 'types',
        kind: ReflectionKind.TypeAlias,
      };
    }
    if (isAll || kindsWithOwnFile.includes('variable')) {
      mappings[ReflectionKind.Variable] = {
        isLeaf: true,
        template: this.memberTemplate,
        directory: 'variables',
        kind: ReflectionKind.Variable,
      };
    }
    return mappings;
  }
}
