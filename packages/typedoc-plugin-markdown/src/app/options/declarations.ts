import { DeclarationOption, ParameterType } from 'typedoc';
import {
  FormatStyle,
  MembersWithOwnFile,
  OutputFileStrategy,
} from './option-maps';
import { TEXT_MAPPING_DEFAULTS } from './text-mappings/text-mapping-defaults';

/**
 *
 * TypeDoc creates documentation according to exports derived from the given [`entryPointsStrategy`](https://typedoc.org/options/input/#entrypointstrategy) configuration.
 *
 * This option does not alter the way TypeDoc interprets the `entryPointsStrategy` but rather provides some flexibility as to how output files are generated.
 *
 * It is also possible to further refine what members are exported to individual files with the [`membersWithOwnFile`](#memberswithownfile) option.
 *
 * The following keys are available:
 *
 * @members
 *
 * Generates an individual file for each exported member. This is the standard behaviour of the HTML theme and the plugin default.
 *
 * <FileTree>
 *  <FileTree.File name="README.md" />
 *  <FileTree.Folder name="module-a" defaultOpen>
 *   <FileTree.Folder name="classes" defaultOpen>
 *   <FileTree.File name="ClassA.md" />
 *   <FileTree.File name="ClassB.md" />
 *  </FileTree.Folder>
 *  <FileTree.Folder name="functions" defaultOpen>
 *    <FileTree.File name="FunctionA.md" />
 *    <FileTree.File name="FunctionB.md" />
 *  </FileTree.Folder>
 * </FileTree.Folder>
 * <FileTree.Folder name="module-b" defaultOpen>
 *  <FileTree.Folder name="classes" defaultOpen>
 *   <FileTree.File name="ClassA.md" />
 *   <FileTree.File name="ClassB.md" />
 *  </FileTree.Folder>
 *  </FileTree.Folder>
 * </FileTree>
 *
 * @modules
 *
 * Generates a single file for every Module or Namespace where all members are hoisted to a single module file. This creates a flat navigation structure and reduces the amount of files generated.
 *
 * <FileTree>
 *  <FileTree.File name="README.md" />
 *  <FileTree.File name="module-a.md" />
 *  <FileTree.File name="module-b.md" />
 * </FileTree>
 *
 * @category Output
 */
export const outputFileStrategy: Partial<DeclarationOption> = {
  help: 'Determines how output files are generated.',
  type: ParameterType.Map,
  map: OutputFileStrategy,
  defaultValue: OutputFileStrategy.Members,
};

/**
 * This option is useful when only specific types of members should be exported to a single file.
 *
 * Ignored when [`outputFileStrategy`](#outputfilestrategy) is equal to `"modules"`
 *
 * @example ["Class", "Enum", "Interface"]
 *
 * @category Output
 */
export const membersWithOwnFile: Partial<DeclarationOption> = {
  help: 'Determines which members are exported to their own file when `outputFileStrategy` equals `members`.',
  type: ParameterType.Array,
  validate(values) {
    const validValues = MembersWithOwnFile;
    for (const kind of values) {
      if (!validValues.includes(kind)) {
        throw new Error(
          `'${kind}' is an invalid value for 'membersWithOwnFile'. Must be one of: ${validValues.join(
            ', ',
          )}`,
        );
      }
    }
  },
  defaultValue: MembersWithOwnFile,
};

/**
 * The entry page is the root page of the documentation, equivalent to `index.html` for web pages.
 *
 * `README` is recognised when browsing folders on repos and Wikis and is the plugin default. `index` might be more suitable for static site generators.
 *
 * The content of this file will be resolved in the following order:
 *
 * 1. The value of the [`entryModule`](#entrymodule) option (if defined).
 * 2. The resolved Readme file (skipped if the [`readme`](https://typedoc.org/options/input/#readme) option is set to `none`).
 * 3. The documentation index page.
 *
 * @example "index"
 *
 * @category Output
 *
 */
export const entryFileName: Partial<DeclarationOption> = {
  help: 'The file name of the entry page.',
  type: ParameterType.String,
  defaultValue: 'README',
};

/**
 * Typically markdown files are recognised by the `.md` or `.markdown` file extensions.`.mdx` maybe required for compatibility with certain markdown parsers.
 *
 * @example ".mdx"
 *
 * @category Output
 */
export const fileExtension: Partial<DeclarationOption> = {
  help: 'Specify the file extension for generated output files.',
  type: ParameterType.String,
  defaultValue: '.md',
};

/**
 * This option can be used when the root page of the documentation should be a specific module (typically a module named `index`).
 *
 * The module name should be specified (NOT the reference to the file name).
 *
 * Please note a seperate modules index page will not be generated, therefore would work better if navigation is present.
 *
 * @example "index"
 *
 * @category Output
 */
export const entryModule: Partial<DeclarationOption> = {
  help: 'The name of a module that should act as the root page for the documentation.',
  type: ParameterType.String,
};

/**
 * By default when a readme file is resolved, a seperate readme page is created. This option prepends the readme contents into the index page so only a single root page is generated.
 *
 * This option has no effect when [`readme`](https://typedoc.org/options/input/#readme) is set to `"none"`.
 *
 * @category Output
 *
 */
export const mergeReadme: Partial<DeclarationOption> = {
  help: 'Merges the resolved readme into the project index page.',
  type: ParameterType.Boolean,
  defaultValue: false,
};

/**
 * @category UI
 */
export const hidePageHeader: Partial<DeclarationOption> = {
  help: 'Do not print page header.',
  type: ParameterType.Boolean,
  defaultValue: false,
};

/**
 * @category UI
 */
export const hidePageTitle: Partial<DeclarationOption> = {
  help: 'Do not print page title.',
  type: ParameterType.Boolean,
  defaultValue: false,
};

/**
 * @category UI
 */
export const hideBreadcrumbs: Partial<DeclarationOption> = {
  help: 'Do not print breadcrumbs.',
  type: ParameterType.Boolean,
  defaultValue: false,
};

/**
 * @deprecated In-page TOC is now hidden as default.
 *
 * @category UI
 */
export const hideInPageTOC: Partial<DeclarationOption> = {
  help: 'Do not render in-page TOC items.',
  type: ParameterType.Boolean,
  defaultValue: false,
};

/**
 * Provides a mechanism to change the main project index page title.
 *
 * @deprecated Please use `textContentMappings`.
 *
 * @category UI
 *
 */
export const indexPageTitle: Partial<DeclarationOption> = {
  help: 'The title of project index page.',
  type: ParameterType.String,
  defaultValue: '{ProjectName}',
};

/**
 * Provides a mechanism to configure the page title of members.
 *
 * @deprecated Please use `textContentMappings`.
 *
 * @category UI
 */
export const memberPageTitle: Partial<DeclarationOption> = {
  help: 'The page title of member pages.',
  type: ParameterType.String,
  defaultValue: '{kind}: {name}',
};

/**
 * By default members are grouped by kind (eg Classes, Functions etc).
 *
 * This creates a flat structure where all members are displayed at the same heading level.
 *
 * @category UI
 */
export const excludeGroups: Partial<DeclarationOption> = {
  help: 'Excludes grouping by kind so all members are rendered and sorted at the same level.',
  type: ParameterType.Boolean,
  defaultValue: false,
};

/**
 * This option can be used to improve readability and aesthetics when defining signatures and declarations.
 *
 * Please note that when this option is set to `true` it is not possible to link to other references.
 *
 * As a work around the [`@link`](https://typedoc.org/tags/link/) tag can be be used to manually reference types.
 *
 * @category UI
 */
export const useCodeBlocks: Partial<DeclarationOption> = {
  help: 'Wraps signatures and declarations in code blocks.',
  type: ParameterType.Boolean,
  defaultValue: false,
};

/**
 * By default objects inside declarations are collapsed to preserve space and improve readability.
 *
 * This option should be set when a full object representation is preferred.
 *
 * @Default
 *
 * `Object`
 *
 * @Expanded
 *
 * \{ `x`: `string` }
 *
 * @category UI
 */
export const expandObjects: Partial<DeclarationOption> = {
  help: 'Expand objects inside declarations.',
  type: ParameterType.Boolean,
  defaultValue: false,
};

/**
 * By default parameters in signature definitions only display the parameter name so the output is more concise.
 *
 * This option should be set when a full type representation is preferred.
 *
 * This is the oppisite of TypeDoc's [hideParameterTypesInTitle](https://typedoc.org/options/output/#hideparametertypesintitle) output option.
 *
 * @Default
 *
 * `someFunction(param1, param2)`
 *
 * @Expanded
 *
 * `someFunction(param1: string, param2: boolean)`
 *
 * @category UI
 */
export const expandParameters: Partial<DeclarationOption> = {
  help: 'Expand parameters in signature parentheses to display type information.',
  type: ParameterType.Boolean,
  defaultValue: false,
};

/**
 * This option either renders parameters for functions and class methods as a list or in tabular format.
 *
 * @category UI
 */
export const parametersFormat: Partial<DeclarationOption> = {
  help: 'Specify the render style of parameter and type parameter groups.',
  type: ParameterType.Map,
  map: FormatStyle,
  defaultValue: FormatStyle.List,
};

/**
 *  This option either renders properties for classes and interfaces as a list or in tabular format.
 *
 * @category UI
 *
 */
export const propertiesFormat: Partial<DeclarationOption> = {
  help: 'Specify the render style of property groups for interfaces and classes.',
  type: ParameterType.Map,
  map: FormatStyle,
  defaultValue: FormatStyle.List,
};

/**
 * This option either renders members of enums as a list or in tabular format.
 *
 * @category UI
 */
export const enumMembersFormat: Partial<DeclarationOption> = {
  help: 'Specify the render style of enumuration members.',
  type: ParameterType.Map,
  map: FormatStyle,
  defaultValue: FormatStyle.List,
};

/**
 * This option either renders type declrations as a list or in tabular format.
 *
 * @category UI
 */
export const typeDeclarationFormat: Partial<DeclarationOption> = {
  help: 'Specify the render style for type declaration members.',
  type: ParameterType.Map,
  map: FormatStyle,
  defaultValue: FormatStyle.List,
};

/**
 * This option renders index items either as a simple list or in a table with a description column exposing the comment summary.
 *
 * @category UI
 */
export const indexFormat: Partial<DeclarationOption> = {
  help: 'Specify the render format for index items.',
  type: ParameterType.Map,
  map: FormatStyle,
  defaultValue: FormatStyle.List,
};

/**
 * This option enables changing static text rendered to the documentation.
 * Useful if an alternative English phrase is preferred or to translate English text to another language.
 * This option does not attempt to address translating text within code comments.
 *
 * **Placeholders**
 *
 * Default values within curly braces `{}` indicates a placeholder of dynamic text.
 * The `{version}` placeholder requires the TypeDoc option [`includeVersion`](https://typedoc.org/options/input/#includeversion) to be true.
 *
 * **keys**
 *
 * Keys are categorised with the following namespace conventions:
 *
 * - `header.*` defines text in the page header (if displayed).
 * - `breadcrumbs.*` defines breadcrumbs in page header (if displayed).
 * - `title.*` defines text in main page titles.
 * - `label.*` other text in page content, including headings and table headers.
 * - `kind.*` defines text mappings to TypeDoc's `ReflectionKind` definitions.
 *
 * Only keys that require translation need to be added to the object.
 *
 * @category UI
 */
export const textContentMappings: Partial<DeclarationOption> = {
  help: 'Provides a mechanism to change the content of text used in documentation.',
  type: ParameterType.Mixed,
  defaultValue: TEXT_MAPPING_DEFAULTS,
  validate(value) {
    if (!value || typeof value !== 'object') {
      throw new Error(
        '[typedoc-plugin-markdown] textContentMappings must be an object.',
      );
    }

    for (const val of Object.values(value)) {
      if (typeof val !== 'string') {
        throw new Error(
          `[typedoc-plugin-markdown] All values of textContentMappings must be strings.`,
        );
      }
    }

    for (const key of Object.keys(value)) {
      if (!Object.keys(TEXT_MAPPING_DEFAULTS).includes(key)) {
        throw new Error(
          `[typedoc-plugin-markdown] "${key}" is not a valid "textContentMappings" key. Valid keys are ${Object.keys(
            TEXT_MAPPING_DEFAULTS,
          )
            .map((key) => `"${key}"`)
            .join(', ')}.`,
        );
      }
    }
  },
};

/**
 * If undefined all urls will be relative.
 *
 * @example "http://abc.com"
 *
 * @category Utility
 */
export const publicPath: Partial<DeclarationOption> = {
  help: 'Specify the base path for all urls.',
  type: ParameterType.String,
  defaultValue: undefined,
};

/**
 * By default non html tags inside comments are escaped.
 *
 * This option should be used when parsers require the preservation of non-html tags, for example if some custom JSX tags are required to be interpreted in final output.
 *
 * @category Utility
 */
export const preserveMarkup: Partial<DeclarationOption> = {
  help: 'Preserves non-html markup tags in comments.',
  type: ParameterType.Boolean,
  defaultValue: false,
};

/**
 * By default references to symbol anchor links are lowercased.
 *
 * This option can be used for engines that require the preservation of anchor link casing.
 *
 * @category Utility
 */
export const preserveAnchorCasing: Partial<DeclarationOption> = {
  help: 'Preserve anchor casing when generating link to symbols.',
  type: ParameterType.Boolean,
  defaultValue: false,
};

/**
 * This option should be used when parsers requiren a custom anchor prefix.
 *
 * @example "markdown-header"
 *
 * @category Utility
 */
export const anchorPrefix: Partial<DeclarationOption> = {
  help: 'Custom anchor prefix',
  type: ParameterType.String,
  defaultValue: undefined,
};

/**
 * This option should be used if there are issues with anchoring to symbols within a page.
 *
 * - For markdown parsers that do not automatically assign header ids.
 * - When cross referencing symbols that are referenced in a table row.
 *
 * @category Utility
 */
export const namedAnchors: Partial<DeclarationOption> = {
  help: 'Add HTML named anchors to headings and table rows.',
  type: ParameterType.Boolean,
  defaultValue: false,
};
