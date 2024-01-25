import * as fs from 'fs';
import {
  Application,
  DeclarationReflection,
  ProjectReflection,
  Reflection,
  Renderer,
} from 'typedoc';
import { MarkdownPageEvent, MarkdownRendererEvent } from './events.js';
import { nicePath, writeFileSync } from './utils.js';

/**
 * Contains functionality to decouple HTML logic from the TypeDoc's {@link Renderer}.
 *
 * @todo Investigate ways to properly decouple HTML logic from the TypeDoc renderer.
 *
 * @module
 */

/**
 * Replacement of TypeDoc's {@link Application.generateDocs} method to decouple HTML logic.
 *
 */
export async function generateDocs(project: ProjectReflection, out: string) {
  const start = Date.now();
  await this.renderer.render(project, out);
  if (this.logger.hasErrors()) {
    this.logger.error(
      'Documentation could not be generated due to the errors above.',
    );
  } else {
    this.logger.info(`Documentation generated at ${nicePath(out)}`);
    this.logger.verbose(`Markdown rendering took ${Date.now() - start}ms`);
  }
}

/**
 * Replacement of TypeDoc's {@link Renderer.render} method to decouple HTML logic.
 *
 * This is essentially a copy of the base method with a few tweaks.
 *
 * - Removes uneccessary async calls to load highlighters only required for html theme.
 * - Removes hooks logic that are jsx specific.
 * - Adds any logic specific to markdown rendering.
 */
export async function render(
  project: ProjectReflection,
  outputDirectory: string,
) {
  this.renderStartTime = Date.now();

  if (this.cleanOutputDir) {
    try {
      fs.rmSync(outputDirectory, { recursive: true, force: true });
    } catch (error) {
      this.application.logger.warn('Could not empty the output directory.');
      return;
    }
  }

  try {
    fs.mkdirSync(outputDirectory, { recursive: true });
  } catch (error) {
    this.application.logger.error(
      `Could not create output directory ${outputDirectory}.`,
    );
    return;
  }

  this.prepareTheme();

  const output = new MarkdownRendererEvent(
    MarkdownRendererEvent.BEGIN,
    outputDirectory,
    project,
  );

  output.urls = this.theme!.getUrls(project);
  output.navigation = this.theme!.getNavigation(project);

  this.trigger(output);

  await Promise.all(this.preRenderAsyncJobs.map((job) => job(output)));

  this.preRenderAsyncJobs = [];

  this.application.logger.verbose(
    `There are ${output.urls?.length} pages to write.`,
  );

  output.urls
    ?.filter(
      (urlMapping) =>
        urlMapping.model instanceof ProjectReflection ||
        urlMapping.model instanceof DeclarationReflection,
    )
    .forEach(async (urlMapping) => {
      const [template, page] = output.createPageEvent(urlMapping);

      this.trigger(MarkdownPageEvent.BEGIN, page);
      if (page.isDefaultPrevented) {
        return false;
      }

      if (page.model instanceof Reflection) {
        page.contents = this.theme!.render(page, template);
      } else {
        throw new Error('Should be unreachable');
      }

      this.trigger(MarkdownPageEvent.END, page);

      if (page.isDefaultPrevented) {
        return false;
      }

      try {
        writeFileSync(page.filename, page.contents as string);
      } catch (error) {
        this.application.logger.error(`Could not write ${page.filename}`);
      }
    });

  await Promise.all(this.postRenderAsyncJobs.map((job) => job(output)));

  this.postRenderAsyncJobs = [];

  this.trigger(MarkdownRendererEvent.END, output);

  this.theme = void 0;
}
