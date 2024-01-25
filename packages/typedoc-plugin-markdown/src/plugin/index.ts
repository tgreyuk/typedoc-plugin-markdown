import {
  Application,
  Context,
  Converter,
  DeclarationOption,
  EventHooks,
  Renderer,
  Theme,
} from 'typedoc';
import { MarkdownTheme } from '../theme/index.js';
import * as declarations from './options/declarations.js';
import { generateDocs, render } from './renderer.js';
import { MarkdownRenderer, MarkdownRendererHooks } from './types.js';

/**
 *
 * The function that is called by TypeDoc to bootstrap the plugin. {@see https://typedoc.org/guides/development/#plugins}
 *
 * Here we expose additional TypeDoc options and make some adjustments.
 *
 */
export function load(app: Application) {
  /**
   * ====================
   * 1. Bootstrap Options
   * ====================
   */

  /**
   * Interate over declaration definitions and to the container.
   */
  Object.entries(declarations).forEach(([name, declaration]) => {
    app.options.addDeclaration({
      name,
      ...declaration,
    } as DeclarationOption);
  });

  /**
   * =================================================
   * 2. Intercept and modify some TypeDoc core methods
   * =================================================
   *
   * Currently the TypeDoc {@link Renderer} class is quite coupled to the HTML theme so we override a couple of core methods.
   *
   * @todo Ideally there would be proper decoupling in the TypeDoc core between the {@link Application} and {@link Renderer} which requires further investigation.
   *
   */

  /**
   * Replace the default HTML theme the with the {@link MarkdownTheme}
   */
  Object.defineProperty(app.renderer, 'themes', {
    value: new Map<string, new (renderer: Renderer) => Theme>([
      ['default', MarkdownTheme],
    ]),
  });

  /**
   * Replace TypeDoc's {@link app.generateDocs} method with our own {@link generateDocs} method.
   */
  Object.defineProperty(app, 'generateDocs', { value: generateDocs });

  /**
   * Replace TypeDoc's {@link app.renderer.render} method with our own {@link render} method.
   */
  Object.defineProperty(app.renderer, 'render', {
    value: render,
  });

  /**
   * Add a new {@link MarkdownRendererHooks} property to the {@link MarkdownRenderer} class.
   * This is used to hook into the TypeDoc rendering system.
   */
  Object.defineProperty(app.renderer, 'markdownHooks', {
    value: new EventHooks<MarkdownRendererHooks, string>(),
  });

  /**
   * ============================
   * 3. Apply any other behaviour
   * ============================
   */

  /**
   * Currently options set for packages are only stored on the converter and are destroyed before being passed to the {@link Renderer}.
   *
   * By intercepting the package options set in the converter and storing them on the renderer we can use them later in the theme.
   *
   * @todo Ideally this functionality would be available in TypeDoc core - to investigate.
   */
  app.converter.on(Converter.EVENT_RESOLVE_END, (context: Context) => {
    if (app.options.packageDir) {
      const renderer = app.renderer as MarkdownRenderer;
      renderer.packageOptions = {
        ...(renderer.packageOptions || {}),
        [context.project.name]: app.options,
      };
    }
  });
}

export * from './events.js';
export * from './options/option-maps.js';
export * from './options/option-types.js';
export * from './types.js';
