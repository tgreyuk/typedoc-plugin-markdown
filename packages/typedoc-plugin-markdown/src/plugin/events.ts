import * as path from 'path';
import { Event, ProjectReflection, Reflection } from 'typedoc';
import { NavigationItem, RenderTemplate, UrlMapping } from '../theme/index.js';

/**
 * Extends the RendererEvent from TypeDoc to expose navigation property.
 */

export class MarkdownRendererEvent extends Event {
  readonly project: ProjectReflection;

  readonly outputDirectory: string;

  urls?: UrlMapping<Reflection>[];
  navigation: NavigationItem[];

  static readonly BEGIN = 'beginRender';
  static readonly END = 'endRender';

  constructor(
    name: string,
    outputDirectory: string,
    project: ProjectReflection,
  ) {
    super(name);
    this.outputDirectory = outputDirectory;
    this.project = project;
  }

  public createPageEvent<Model>(
    mapping: UrlMapping<Model>,
  ): [RenderTemplate<MarkdownPageEvent<Model>>, MarkdownPageEvent<Model>] {
    const event = new MarkdownPageEvent<Model>(
      MarkdownPageEvent.BEGIN,
      mapping.model,
    );
    event.project = this.project;
    event.url = mapping.url;
    event.filename = path.join(this.outputDirectory, mapping.url);
    return [mapping.template, event];
  }
}

export class MarkdownPageEvent<out Model = Reflection> extends Event {
  project!: ProjectReflection;
  filename!: string;
  url!: string;
  contents?: string;
  frontmatter?: any;
  pageHeadings: any;
  readonly model: Model;
  static readonly BEGIN = 'beginPage';
  static readonly END = 'endPage';
  constructor(name: string, model: Model) {
    super(name);
    this.model = model;
  }
}
