import { Options, Reflection } from 'typedoc';
import { MarkdownPageEvent, MarkdownTheme } from '../index.js';
import { MarkdownRenderer, MarkdownRendererHooks } from '../plugin/types.js';
import { partials, templates } from './resources/index.js';
import { helpers } from './support/support.helpers.js';
import { markdown } from './support/support.markdown.js';
import { text } from './support/support.text.js';
import { utils } from './support/support.utils.js';

/* start_imports */
/* end_imports */

/**
 * The render context of the {@link MarkdownTheme}.
 * This follows the implementation of TypeDocs [DefaultThemeRenderContext](https://typedoc.org/api/classes/DefaultThemeRenderContext.html)
 */

export class MarkdownThemeRenderContext {
  /**
   * @param page The page this context is created for.
   * @param options The options used by TypeDoc. See TypeDoc's {@link typedoc!Options | Options} Class.
   */
  constructor(
    private theme: MarkdownTheme,
    readonly page: MarkdownPageEvent<Reflection> | null,
    readonly options: Options,
  ) {}

  /**
   * Returns an object with methods for generating markdown syntax.
   *
   * Each method returns a string formatted according to markdown rules.
   *
   * This can consumed by theme templates and partials using the syntax `context.markdown.method()`.
   */
  markdown = markdown();

  /**
   * A set of pure utils to be consumed accross the plugin.
   *
   * These can be consumed by theme templates and partials using the syntax `context.utils.method()`.
   */
  utils = utils();

  /**
   * A set of methods to return strings from specific TypeDoc models.
   *
   * These can be consumed by theme templates and partials using the syntax `context.models.method()`.
   */
  helpers = helpers();

  /**
   * The theme's global text context.
   */
  text = text(this.options);

  /**
   * The theme's global templates context.
   */
  templates = templates(this);

  /**
   * The theme's global partials context.
   */
  partials = partials(this);

  /**
   * Hook into the TypeDoc rendering system.
   */
  hook = (name: keyof MarkdownRendererHooks) =>
    (this.theme.owner as MarkdownRenderer).markdownHooks.emit(name, this);
}
