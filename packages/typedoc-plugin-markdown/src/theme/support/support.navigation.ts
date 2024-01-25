import * as path from 'path';
import {
  DeclarationReflection,
  EntryPointStrategy,
  ProjectReflection,
  ReflectionCategory,
  ReflectionGroup,
  ReflectionKind,
} from 'typedoc';
import { MarkdownTheme } from '../../index.js';
import { OutputFileStrategy } from '../../plugin/options/option-maps.js';
import { text } from './support.text.js';

export interface NavigationItem {
  title: string;
  url?: string;
  children?: NavigationItem[];
  isReadme?: boolean;
  isGroup?: boolean;
}

export function getNavigation(
  theme: MarkdownTheme,
  project: ProjectReflection,
) {
  const options = theme.application.options;
  const navigation: NavigationItem[] = [];
  const optionsForPackages = (theme.application.renderer as any).packageOptions;
  const textUtils = text(options);

  const isPackages =
    options.getValue('entryPointStrategy') === EntryPointStrategy.Packages;

  if (isPackages) {
    if (Object.keys(optionsForPackages)?.length === 1) {
      buildNavigationFromProject(project);
    } else {
      project.children?.forEach((projectChild) => {
        buildNavigationFromPackage(projectChild);
      });
    }
  } else {
    buildNavigationFromProject(project);
  }

  return navigation;

  function buildNavigationFromPackage(projectChild: DeclarationReflection) {
    const entryFileName = options.getValue('entryFileName');
    const preservePackageReadme =
      Boolean(projectChild.readme) && !options.getValue('mergeReadme');

    const packageOptions = optionsForPackages[projectChild.name];

    const isSet = packageOptions.isSet('outputFileStrategy');

    const outputFileStrategy = isSet
      ? packageOptions.getValue('outputFileStrategy')
      : options.getValue('outputFileStrategy');

    const projectChildUrl = preservePackageReadme
      ? `${path.dirname(projectChild.url as string)}/${entryFileName}`
      : projectChild.url;

    const isModulesGroup =
      projectChild?.groups &&
      projectChild?.groups[0].children.every((child) =>
        child.kindOf(ReflectionKind.Module),
      );

    const children: NavigationItem[] = [];

    if (
      preservePackageReadme &&
      !isModulesGroup &&
      outputFileStrategy === OutputFileStrategy.Modules
    ) {
      children.push({
        title: textUtils.get('label.globals'),
        url: projectChild.url,
      });
    }
    const childGroups = getChildrenOrGroups(projectChild, outputFileStrategy);

    if (childGroups) {
      children.push(...childGroups);
    }

    navigation.push({
      title: projectChild.name,
      children,
      ...(projectChildUrl && { url: projectChildUrl }),
    });
  }

  function buildNavigationFromProject(
    project: ProjectReflection | DeclarationReflection,
  ) {
    const entryModule = options.getValue('entryModule');
    if (project.groups?.length) {
      const isEntryModule = Boolean(
        project?.groups[0]?.children.find(
          (child) => child.name === entryModule,
        ),
      );
      const isOnlyModules = project.children?.every((child) =>
        child.kindOf(ReflectionKind.Module),
      );
      if (
        (project.groups.length === 1 && !Boolean(isEntryModule)) ||
        isOnlyModules
      ) {
        const children = getGroupChildren(project.groups[0]);
        if (children) {
          navigation.push(
            ...children.filter((child) => child.title !== entryModule),
          );
        }
      } else {
        project.groups?.forEach((projectGroup) => {
          const children = getGroupChildren(projectGroup);
          const indexModule = projectGroup.children.find(
            (child) => child.name === entryModule,
          );
          if (children.length) {
            navigation.push({
              title: projectGroup.title,
              children: children.filter((child) => child.title !== entryModule),
            });
          }
          if (indexModule) {
            const children = getChildrenOrGroups(indexModule);
            if (children) {
              navigation.push(...children);
            }
          }
        });
      }
    }
  }

  function getCategoryGroupChildren(group: ReflectionCategory) {
    return group.children
      ?.filter((child) => child.hasOwnDocument)
      .map((child) => {
        const children = getChildrenOrGroups(child);
        return {
          title: child.name,
          url: child.url,
          ...(children && { children }),
        };
      });
  }

  function getGroupChildren(
    group: ReflectionGroup,
    outputFileStrategy?: OutputFileStrategy,
  ) {
    if (group?.categories?.length) {
      return group.categories?.map((category) => {
        return {
          title: category.title,
          children: getCategoryGroupChildren(category),
        };
      });
    }

    return group.children
      ?.filter((child) => child.hasOwnDocument)
      .map((child) => {
        const mapping = theme.getTemplateMapping(
          child.kind,
          outputFileStrategy,
        );

        if (Boolean(mapping)) {
          const children = child.categories?.length
            ? child.categories
                ?.map((category) => {
                  const catChildren = getCategoryGroupChildren(category);
                  return catChildren.length
                    ? {
                        title: category.title,
                        children: catChildren,
                      }
                    : null;
                })

                .filter((cat) => Boolean(cat))
            : getChildrenOrGroups(child, outputFileStrategy);
          return {
            title: child.name,
            url: child.url,
            ...(children && { children }),
          };
        }
      });
  }

  function getChildrenOrGroups(
    reflection: DeclarationReflection,
    outputFileStrategy?: OutputFileStrategy,
  ) {
    if (
      reflection.groups?.some((group) => group.allChildrenHaveOwnDocument())
    ) {
      if (options.getValue('excludeGroups')) {
        return reflection.children
          ?.filter((child) => child.hasOwnDocument)
          .map((child) => {
            const children = getChildrenOrGroups(child, outputFileStrategy);
            return {
              title: child.name,
              url: child.url,
              ...(children && { children }),
            };
          });
      }

      const isModulesGroup = reflection.groups[0].children.every((child) =>
        child.kindOf(ReflectionKind.Module),
      );

      if (isModulesGroup) {
        return (
          getGroupChildren(reflection.groups[0], outputFileStrategy) || null
        );
      }

      return reflection.groups
        ?.map((group) => {
          const groupChildren = getGroupChildren(group, outputFileStrategy);
          return groupChildren.length
            ? {
                title: textUtils.groupTitle(group.title),
                children: groupChildren || null,
              }
            : null;
        })
        .filter((group) => Boolean(group));
    }
    return null;
  }
}
