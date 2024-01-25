import * as path from 'path';
import {
  DeclarationReflection,
  EntryPointStrategy,
  ProjectReflection,
  Reflection,
  ReflectionKind,
} from 'typedoc';
import { MarkdownPageEvent, MarkdownTheme } from '../../index.js';
import { OutputFileStrategy } from '../../plugin/options/option-maps.js';

export interface UrlOption {
  parentUrl?: string;
  directory?: string | null;
  forceDirectory?: boolean;
  outputFileStrategy?: OutputFileStrategy;
}

export interface TemplateMapping {
  directory: string | null;
  template: any;
  kind: ReflectionKind;
}

export interface UrlMapping<Model = any> {
  url: string;
  model: Model;
  template: RenderTemplate<MarkdownPageEvent<Model>>;
}

export type RenderTemplate<T> = (data: T) => string;

/**
 * Map the models of the given project to the desired output files.
 * Based on TypeDoc DefaultTheme.getUrls()
 *
 * @param project  The project whose urls should be generated.
 */
export function getUrls(theme: MarkdownTheme, project: ProjectReflection) {
  const options = theme.application.options;
  const optionsForPackages = (theme.application.renderer as any).packageOptions;
  const urls: UrlMapping<Reflection>[] = [];
  const anchors: Record<string, string[]> = {};

  const preserveReadme =
    Boolean(project.readme) && !options.getValue('mergeReadme');

  const preserveModulesPage =
    (project?.groups &&
      Boolean(
        project?.groups[0]?.children.find(
          (child) => child.name === options.getValue('entryModule'),
        ),
      )) ||
    false;

  const isPackages =
    options.getValue('entryPointStrategy') === EntryPointStrategy.Packages;

  const entryFileName = options.getValue('entryFileName');

  const indexFilename = getIndexFileName(project, isPackages);

  project.url = preserveReadme
    ? indexFilename
    : preserveModulesPage
      ? indexFilename
      : options.getValue('entryFileName');

  if (preserveReadme) {
    urls.push({
      url: preserveModulesPage ? 'readme_.md' : entryFileName,
      model: project,
      template: theme.readmeTemplate,
    });
    urls.push({
      url: indexFilename,
      model: project,
      template: theme.projectTemplate,
    });
  } else {
    urls.push({
      url: preserveModulesPage ? indexFilename : entryFileName,
      model: project,
      template: theme.projectTemplate,
    });
  }

  if (isPackages) {
    if (Object.keys(optionsForPackages)?.length === 1) {
      buildUrlsFromProject(project);
    } else {
      project.children?.forEach((projectChild) => {
        buildUrlsFromPackage(projectChild);
      });
    }
  } else {
    buildUrlsFromProject(project);
  }

  return urls;

  function buildUrlsFromProject(
    project: ProjectReflection | DeclarationReflection,
    parentUrl?: string,
    outputFileStrategy?: OutputFileStrategy,
  ) {
    project.groups?.forEach((projectGroup) => {
      projectGroup.children?.forEach((projectGroupChild) => {
        buildUrlsFromGroup(projectGroupChild, {
          ...(parentUrl && { parentUrl }),
          ...(outputFileStrategy && { outputFileStrategy }),
        });
      });
    });
  }

  function buildUrlsFromPackage(projectChild: DeclarationReflection) {
    const entryFileName = options.getValue('entryFileName');
    const preservePackageReadme =
      Boolean(projectChild.readme) && !options.getValue('mergeReadme');

    const packagesIndex = getIndexFileName(projectChild);

    const packageOptions = optionsForPackages[projectChild.name];

    const isSet = packageOptions.isSet('outputFileStrategy');

    const outputFileStrategy = isSet
      ? packageOptions.getValue('outputFileStrategy')
      : options.getValue('outputFileStrategy');

    const url = `${projectChild.name}/${
      preservePackageReadme ? packagesIndex : entryFileName
    }`;

    if (preservePackageReadme) {
      urls.push({
        url: `${path.dirname(url)}/${entryFileName}`,
        model: projectChild as any,
        template: theme.readmeTemplate,
      });
    }
    urls.push({
      url: url,
      model: projectChild as any,
      template: theme.projectTemplate,
    });

    projectChild.url = url;

    buildUrlsFromProject(projectChild, url, outputFileStrategy);
  }

  function buildUrlsFromGroup(
    reflection: DeclarationReflection,
    options: UrlOption,
  ) {
    const mapping: TemplateMapping = theme.getTemplateMapping(
      reflection.kind,
      options.outputFileStrategy,
    );

    if (mapping) {
      const directory = options.directory || mapping.directory;
      const urlPath = getUrlPath(reflection, {
        ...options,
        directory,
      });

      const url = getUrl(reflection, urlPath);
      urls.push({
        url: url,
        model: reflection,
        template: mapping.template,
      });

      reflection.url = url;
      reflection.hasOwnDocument = true;

      reflection.groups?.forEach((group) => {
        group.children.forEach((groupChild) => {
          const mapping = theme.getTemplateMapping(
            groupChild.kind,
            options.outputFileStrategy,
          );
          buildUrlsFromGroup(groupChild, {
            parentUrl: urlPath,
            directory: mapping?.directory || null,
            outputFileStrategy: options.outputFileStrategy,
          });
        });
      });
    } else if (reflection.parent) {
      applyAnchorUrl(reflection, reflection.parent);
    }
  }

  function getUrl(reflection: DeclarationReflection, urlPath: string) {
    if (reflection.name === options.getValue('entryModule')) {
      return options.getValue('entryFileName');
    }
    if (
      options.getValue('outputFileStrategy') === OutputFileStrategy.Modules &&
      reflection.name === 'index'
    ) {
      return urlPath.replace('index.md', 'module.index.md');
    }
    return urlPath;
  }

  function getUrlPath(reflection: DeclarationReflection, urlOption: UrlOption) {
    const alias = reflection.name
      .replace(/^_+/, '')
      .replace(/</, '-')
      .replace(/>/, '-');

    const parentDir = urlOption.parentUrl
      ? path.dirname(urlOption.parentUrl)
      : null;

    const dir = () => {
      if (reflection.kind === ReflectionKind.Namespace) {
        return `${urlOption.directory}/${alias}`;
      }

      if (reflection.kind === ReflectionKind.Module) {
        return alias;
      }

      const slugifyUrl = (url: string) => {
        return url
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      };

      return urlOption.directory
        ? urlOption.directory
        : `${slugifyUrl(
            ReflectionKind.singularString(reflection.kind),
          )}.${alias}`;
    };

    const filename = () => {
      if (
        [ReflectionKind.Module, ReflectionKind.Namespace].includes(
          reflection.kind,
        ) &&
        options.getValue('outputFileStrategy') === OutputFileStrategy.Modules &&
        !childrenIncludeNamespaces(reflection)
      ) {
        return null;
      }
      if (
        [ReflectionKind.Module, ReflectionKind.Namespace].includes(
          reflection.kind,
        )
      ) {
        return path.parse(options.getValue('entryFileName')).name;
      }
      return alias;
    };

    return (
      [parentDir, dir(), filename()].filter((part) => Boolean(part)).join('/') +
      '.md'
    );
  }

  function applyAnchorUrl(
    reflection: DeclarationReflection,
    container: Reflection,
  ) {
    if (container.url) {
      if (!reflection.kindOf(ReflectionKind.TypeLiteral)) {
        const anchorPrefix = options.getValue('anchorPrefix');
        const anchorId = getAnchorId(reflection);

        if (anchorId) {
          if (!anchors[container.url]) {
            anchors[container.url] = [];
          }

          anchors[container.url].push(anchorId);

          const count = anchors[container.url]?.filter(
            (id) => id === anchorId,
          )?.length;

          const anchorParts = [anchorId];

          if (count > 1) {
            anchorParts.push(`-${count - 1}`);
          }

          if (anchorPrefix) {
            anchorParts.unshift(`${anchorPrefix}`);
          }

          reflection.url = container.url + '#' + anchorParts.join('');
          reflection.anchor = anchorParts.join('');
        }
      }
      reflection.hasOwnDocument = false;
    }
    if (reflection.parent) {
      reflection.traverse((child) => {
        if (child instanceof DeclarationReflection) {
          applyAnchorUrl(child, container);
        }
      });
    }
  }

  function getAnchorId(reflection: DeclarationReflection) {
    const preserveAnchorCasing = options.getValue('preserveAnchorCasing');

    const anchorName = getAnchorName(reflection);

    if (anchorName) {
      return preserveAnchorCasing ? anchorName : anchorName.toLowerCase();
    }

    return null;
  }

  function getAnchorName(reflection: DeclarationReflection) {
    const htmlTableAnchors = options.getValue('namedAnchors');

    if (!htmlTableAnchors) {
      if (
        (reflection.kindOf(ReflectionKind.Property) &&
          options.getValue('propertiesFormat') === 'table') ||
        (reflection.kindOf(ReflectionKind.EnumMember) &&
          options.getValue('enumMembersFormat') === 'table')
      ) {
        return null;
      }
    }
    if (reflection.kindOf(ReflectionKind.Constructor)) {
      return 'Constructors';
    }
    const anchorParts = [reflection.name];
    if (reflection.typeParameters?.length) {
      anchorParts.push(
        reflection.typeParameters
          .map((typeParameter) => typeParameter.name)
          .join(''),
      );
    }
    return anchorParts.join('');
  }

  function childrenIncludeNamespaces(reflection: DeclarationReflection) {
    return reflection.children?.some(
      (child) => child.kind === ReflectionKind.Namespace,
    );
  }

  function getIndexFileName(
    reflection: ProjectReflection | DeclarationReflection,
    isPackages = false,
  ) {
    if (isPackages) {
      return 'packages.md';
    }
    const isModules = reflection.children?.every((child) =>
      child.kindOf(ReflectionKind.Module),
    );
    return isModules ? 'modules.md' : 'globals.md';
  }
}
