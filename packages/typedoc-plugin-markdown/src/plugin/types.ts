import { Application, EventHooks, Options, Renderer } from 'typedoc';
import { MarkdownThemeRenderContext } from '../theme/index.js';
import { MarkdownRendererEvent } from './events.js';

/**
 * The plugin amends the renderer with additional hooks and options.
 *
 * This interface augments the TypeDoc {@link Application} with the updated renderer.
 */
export interface MarkdownApplication extends Application {
  renderer: MarkdownRenderer;
}

/**
 * The plugin amends the renderer with additional hooks and options.
 */
export interface MarkdownRenderer extends Renderer {
  markdownHooks: EventHooks<MarkdownRendererHooks, string>;
  packageOptions: Record<string, Options>;
  preRenderAsyncJobs: Array<(output: MarkdownRendererEvent) => Promise<void>>;
  postRenderAsyncJobs: Array<(output: MarkdownRendererEvent) => Promise<void>>;
}

/**
 * This is the custom render hooks method based on the equivalent TypeDoc class.
 */
export interface MarkdownRendererHooks {
  /**
   * Applied at the start of the markdown output.
   */
  'page.begin': [MarkdownThemeRenderContext];

  /**
   * Applied at the end of the markdown output.
   */
  'page.end': [MarkdownThemeRenderContext];

  /**
   * Applied before the main markdown content is rendered.
   */
  'content.begin': [MarkdownThemeRenderContext];
}
