import * as path from 'path';
import {
  BindOption,
  DeclarationReflection,
  PageEvent,
  ProjectReflection,
  Reflection,
  ReflectionKind,
  Renderer,
  Theme,
  UrlMapping,
} from 'typedoc';
import { TemplateMapping } from './models';
import { URL_PREFIX } from './support/constants';
import { formatContents } from './support/utils';
import { MarkdownThemeRenderContext } from './theme-context';
export class MarkdownTheme extends Theme {
  @BindOption('entryDocument') entryDocument!: string;
  @BindOption('entryPoints') entryPoints!: string[];
  @BindOption('readme') readme!: string;
  @BindOption('preserveAnchorCasing') preserveAnchorCasing!: boolean;
  @BindOption('symbolsWithOwnFile') symbolsWithOwnFile!: string | string[];
  @BindOption('fileStructure') fileStructure!: string;
  @BindOption('flattenOutput') flattenOutput!: string;
  @BindOption('includeExtension') includeExtension!: boolean;

  private _renderContext?: MarkdownThemeRenderContext;

  private anchors: Record<string, string[]>;

  constructor(renderer: Renderer) {
    super(renderer);

    this.anchors = {};

    this.listenTo(this.owner, {
      [PageEvent.BEGIN]: this.onBeginPage,
    });
  }

  getRenderContext() {
    if (!this._renderContext) {
      this._renderContext = new MarkdownThemeRenderContext(
        this,
        this.application.options,
      );
    }
    return this._renderContext;
  }

  readmeTemplate = (pageEvent: PageEvent<ProjectReflection>) => {
    return this.getRenderContext().templates.readmeTemplate(pageEvent);
  };

  projectTemplate = (pageEvent: PageEvent<ProjectReflection>) => {
    return this.getRenderContext().templates.projectTemplate(pageEvent);
  };

  reflectionTemplate = (pageEvent: PageEvent<DeclarationReflection>) => {
    return this.getRenderContext().templates.reflectionTemplate(pageEvent);
  };

  memberTemplate = (pageEvent: PageEvent<DeclarationReflection>) => {
    return this.getRenderContext().templates.memberTemplate(pageEvent);
  };

  render(page: PageEvent<Reflection>): string {
    return formatContents(page.template(page) as string);
  }

  getUrls(project: ProjectReflection) {
    const urls: UrlMapping[] = [];

    const noReadmeFile = this.readme.endsWith('none');
    if (noReadmeFile) {
      project.url = this.entryDocument;
      urls.push(
        new UrlMapping(this.entryDocument, project, this.projectTemplate),
      );
    } else {
      project.url = this.getRenderContext().globalsFile;
      urls.push(
        new UrlMapping(
          this.getRenderContext().globalsFile,
          project,
          this.projectTemplate,
        ),
      );
      urls.push(
        new UrlMapping(this.entryDocument, project, this.readmeTemplate),
      );
    }

    project.children?.forEach((child: Reflection) => {
      if (child instanceof DeclarationReflection) {
        if (this.fileStructure === 'modules') {
          this.buildModuleUrls(child, urls);
        } else {
          this.buildUrls(child, urls);
        }
      }
    });

    return urls;
  }

  buildUrls(
    reflection: DeclarationReflection,
    urls: UrlMapping[],
  ): UrlMapping[] {
    const mapping = this.mappings[reflection.kind];
    if (mapping) {
      if (!reflection.url || !URL_PREFIX.test(reflection.url)) {
        let url = [mapping.directory, this.getUrl(reflection) + '.md'].join(
          '/',
        );

        if (this.flattenOutput) {
          url = url.replace(/\//g, '.');
        }
        urls.push(new UrlMapping(url, reflection, mapping.template));
        reflection.url = url;
        reflection.hasOwnDocument = true;
      }

      reflection.traverse((child) => {
        if (child instanceof DeclarationReflection) {
          this.buildUrls(child, urls);
        } else {
          this.applyAnchorUrl(child, reflection);
        }
        return true;
      });
    } else if (reflection.parent) {
      this.applyAnchorUrl(reflection, reflection.parent);
    }

    return urls;
  }

  getUrl(
    reflection: Reflection,
    relative?: Reflection,
    separator = '.',
  ): string {
    let url = reflection.getAlias();

    if (
      reflection.parent &&
      reflection.parent !== relative &&
      !(reflection.parent instanceof ProjectReflection)
    ) {
      url =
        this.getUrl(reflection.parent, relative, separator) + separator + url;
    }

    return url;
  }

  buildModuleUrls(
    reflection: DeclarationReflection,
    urls: UrlMapping[],
    parentFragments?: string[],
  ): UrlMapping[] {
    const mapping = this.mappings[reflection.kind];

    let fragments;

    if (mapping) {
      const isModuleOrNamespace = reflection.kindOf([
        ReflectionKind.Module,
        ReflectionKind.Namespace,
      ]);

      let fragment: string;

      if (this.symbolsWithOwnFile[0] === 'none') {
        fragment = reflection.getAlias();
      } else {
        fragment = !isModuleOrNamespace
          ? `${mapping.directory}/${reflection.getAlias()}`
          : reflection.getAlias();
      }
      const entryDoc = path.parse(this.entryDocument).name;

      if (!reflection.url || !URL_PREFIX.test(reflection.url)) {
        fragments = [fragment];

        if (parentFragments) {
          fragments.unshift(parentFragments.join('/'));
        }

        if (isModuleOrNamespace && this.symbolsWithOwnFile[0] !== 'none') {
          fragments.push(fragment);
        }

        let url = fragments.join('/') + '.md';

        if (this.flattenOutput) {
          url = url.replace(/\//g, '.');
        }

        urls.push(new UrlMapping(url, reflection, mapping.template));
        reflection.url = url;
        reflection.hasOwnDocument = true;
      }

      for (const child of reflection.children || []) {
        if (mapping.isLeaf) {
          this.applyAnchorUrl(child, reflection);
        } else {
          if (
            fragments[fragments.length - 1] === fragments[fragments.length - 2]
          ) {
            fragments.pop();
          }
          this.buildModuleUrls(child, urls, fragments);
        }
      }
    } else if (reflection.parent) {
      this.applyAnchorUrl(reflection, reflection.parent);
    }

    return urls;
  }

  applyAnchorUrl(
    reflection: Reflection,
    container: Reflection,
    isSymbol = false,
  ) {
    if (
      container.url &&
      (!reflection.url || !URL_PREFIX.test(reflection.url))
    ) {
      const reflectionId = this.preserveAnchorCasing
        ? reflection.name
        : reflection.name.toLowerCase();

      if (isSymbol) {
        this.anchors[container.url]
          ? this.anchors[container.url].push(reflectionId)
          : (this.anchors[container.url] = [reflectionId]);
      }

      const count = this.anchors[container.url]?.filter(
        (id) => id === reflectionId,
      )?.length;

      const anchor =
        reflectionId + (count > 1 ? '-' + (count - 1).toString() : '');

      reflection.url = container.url + '#' + anchor;
      reflection.anchor = anchor;
      reflection.hasOwnDocument = false;
    }
    reflection.traverse((child) => {
      if (child instanceof DeclarationReflection) {
        this.applyAnchorUrl(child, container);
      }
    });
  }

  get mappings(): Record<number, TemplateMapping> {
    const isAll = this.symbolsWithOwnFile.includes('all');

    const mappings = {
      [ReflectionKind.Module]: {
        isLeaf: false,
        template: this.reflectionTemplate,
        directory: 'modules',
        kind: ReflectionKind.Module,
        labelSingular: 'Module',
        labelPlural: 'Modules',
      },
      [ReflectionKind.Namespace]: {
        isLeaf: false,
        template: this.reflectionTemplate,
        directory: 'namespaces',
        kind: ReflectionKind.Namespace,
        labelSingular: 'Namespace',
        labelPlural: 'Namespaces',
      },
    };

    if (isAll || this.symbolsWithOwnFile.includes('class')) {
      mappings[ReflectionKind.Class] = {
        isLeaf: false,
        template: this.reflectionTemplate,
        directory: 'classes',
        kind: ReflectionKind.Class,
        labelSingular: 'Class',
        labelPlural: 'Classes',
      };
    }
    if (isAll || this.symbolsWithOwnFile.includes('interface')) {
      mappings[ReflectionKind.Interface] = {
        isLeaf: false,
        template: this.reflectionTemplate,
        directory: 'interfaces',
        kind: ReflectionKind.Interface,
        labelSingular: 'Interface',
        labelPlural: 'Interfaces',
      };
    }
    if (isAll || this.symbolsWithOwnFile.includes('enum')) {
      mappings[ReflectionKind.Enum] = {
        isLeaf: false,
        template: this.reflectionTemplate,
        directory: 'enums',
        kind: ReflectionKind.Enum,
        labelSingular: 'Enum',
        labelPlural: 'Enums',
      };
    }
    if (isAll || this.symbolsWithOwnFile.includes('function')) {
      mappings[ReflectionKind.Function] = {
        isLeaf: true,
        template: this.memberTemplate,
        directory: 'functions',
        kind: ReflectionKind.Function,
        labelSingular: 'Function',
        labelPlural: 'Functions',
      };
    }
    if (isAll || this.symbolsWithOwnFile.includes('type')) {
      mappings[ReflectionKind.TypeAlias] = {
        isLeaf: true,
        template: this.memberTemplate,
        directory: 'types',
        kind: ReflectionKind.TypeAlias,
        labelSingular: 'Type Aliases',
        labelPlural: 'Type Alias',
      };
    }
    if (isAll || this.symbolsWithOwnFile.includes('var')) {
      mappings[ReflectionKind.Variable] = {
        isLeaf: true,
        template: this.memberTemplate,
        directory: 'variables',
        kind: ReflectionKind.Variable,
        labelSingular: 'Variable',
        labelPlural: 'Variables',
      };
    }
    return mappings;
  }

  protected onBeginPage(page: PageEvent) {
    this.getRenderContext().activeLocation = page.url;
  }
}
