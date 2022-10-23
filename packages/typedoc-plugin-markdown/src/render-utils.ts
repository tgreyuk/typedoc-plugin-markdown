import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import breadcrumbsHelper from './resources/helpers/breadcrumbs';
import commentHelper from './resources/helpers/comment';
import commentsHelper from './resources/helpers/comments';
import declarationTitleHelper from './resources/helpers/declaration-title';
import escapeHelper from './resources/helpers/escape';
import hierarchyHelper from './resources/helpers/hierarchy';
import ifIsReference from './resources/helpers/if-is-reference';
import ifNamedAnchors from './resources/helpers/if-named-anchors';
import ifShowBreadcrumbsHelper from './resources/helpers/if-show-breadcrumbs';
import ifShowNamedAnchorsHelper from './resources/helpers/if-show-named-anchors';
import ifShowPageTitleHelper from './resources/helpers/if-show-page-title';
import ifShowReturnsHelper from './resources/helpers/if-show-returns';
import ifShowTypeHierarchyHelper from './resources/helpers/if-show-type-hierarchy';
import indexSignatureTitleHelper from './resources/helpers/index-signature-title';
import parameterTableHelper from './resources/helpers/parameter-table';
import propertyTableHelper from './resources/helpers/property-table';
import referenceMember from './resources/helpers/reference-member';
import reflectionPathHelper from './resources/helpers/reflection-path';
import reflectionTitleHelper from './resources/helpers/reflection-title';
import relativeUrlHelper from './resources/helpers/relative-url';
import returns from './resources/helpers/returns';
import signatureTitleHelper from './resources/helpers/signature-title';
import tocHelper from './resources/helpers/toc';
import typeHelper from './resources/helpers/type';
import typeAndParentHelper from './resources/helpers/type-and-parent';
import typeParameterTableHelper from './resources/helpers/type-parameter-table';
import { MarkdownTheme } from './theme';

export enum TemplateName {
  Index = 'index',
  Reflection = 'reflection',
  ReflectionMember = 'reflection.member'
}

let compiledTemplates: Record<TemplateName, HandlebarsTemplateDelegate>;

export function compileTemplates(theme: MarkdownTheme) {
  // Default template files
  const templatesFolder = path.join(__dirname, 'resources', 'templates');
  const templateFiles: Record<TemplateName, string> = {
    [TemplateName.Index]: path.join(templatesFolder, 'index.hbs'),
    [TemplateName.Reflection]: path.join(templatesFolder, 'reflection.hbs'),
    [TemplateName.ReflectionMember]: path.join(templatesFolder, 'reflection.member.hbs')
  }
  // Merge in user-defined templates
  if (theme.customTemplates) {
    // Merge the custom templates into the defaults
    Object.entries(theme.customTemplates).forEach(([name, path]) => {
      if (path) {
        console.debug(`[Markdown Plugin] Using custom template "${name}" = ${path}`)
        templateFiles[name] = path;
      } else {
        console.warn(`Custom template "${name}" was defined with an empty file path, so it will be ignored.`);
      }
    })
  }
  // Read file contents and compile
  const compiled: Partial<typeof compiledTemplates> = {}
  Object.entries(templateFiles).forEach(([templateName, filePath]) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template "${templateName}" file does not exist at path: ${filePath}`);
    }
    compiled[templateName] = Handlebars.compile(fs.readFileSync(filePath).toString());
  });
  // Set global variable
  compiledTemplates = compiled as typeof compiledTemplates;
}

export function getCompiledTemplate<T = any>(templateName: TemplateName): HandlebarsTemplateDelegate<T> {
  if (!compiledTemplates) {
    throw new Error(`Failed to get template "${templateName}" because templates have not yet been compiled.`)
  }
  if (!compiledTemplates[templateName]) {
    throw new Error(`Template "${templateName}" has no compiled template.`)
  }
  return compiledTemplates[templateName] as HandlebarsTemplateDelegate<T>;
}

export function registerPartials(theme: MarkdownTheme) {
  // Default partials files
  const partialFilePaths: Record<string, string> = {};
  const partialsFolder = path.join(__dirname, 'resources', 'partials');
  const partialFiles = fs.readdirSync(partialsFolder);
  partialFiles.forEach((partialFile) => {
    const partialName = path.basename(partialFile, '.hbs');
    partialFilePaths[partialName] = partialsFolder + '/' + partialFile;
  });
  // Merge in user-defined partials
  Object.entries(theme.customPartials).forEach(([name, path]) => {
    if (path) {
      console.debug(`[Markdown Plugin] Using custom partial "${name}" = ${path}`)
      partialFilePaths[name] = path;
    } else {
      console.warn(`Custom partial "${name}" was defined with an empty file path, so it will be ignored.`);
    }
  })
  // Read file contents and register
  Object.entries(partialFilePaths).forEach(([partialName, filePath]) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Partial "${partialName}" file does not exist at path: ${filePath}`);
    }
    const partialContent = fs
      .readFileSync(filePath)
      .toString();
    Handlebars.registerPartial(partialName, partialContent);
  });
}

export function registerHelpers(theme: MarkdownTheme) {
  breadcrumbsHelper(theme);
  commentHelper(theme);
  commentsHelper();
  declarationTitleHelper(theme);
  escapeHelper();
  hierarchyHelper();
  ifIsReference();
  ifNamedAnchors(theme);
  ifShowBreadcrumbsHelper(theme);
  ifShowNamedAnchorsHelper(theme);
  ifShowPageTitleHelper(theme);
  ifShowReturnsHelper();
  ifShowTypeHierarchyHelper();
  indexSignatureTitleHelper();
  parameterTableHelper();
  propertyTableHelper();
  referenceMember();
  reflectionPathHelper();
  reflectionTitleHelper(theme);
  relativeUrlHelper(theme);
  returns();
  signatureTitleHelper(theme);
  tocHelper(theme);
  typeHelper();
  typeAndParentHelper();
  typeParameterTableHelper();
}
