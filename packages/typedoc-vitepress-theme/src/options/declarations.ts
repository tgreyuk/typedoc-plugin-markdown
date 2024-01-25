import { ParameterType } from 'typedoc';
import { DEFAULT_SIDEBAR_OPTIONS } from '../options.js';

/**
 *
 * If TypeDoc is run from outside of the VitePress project root directory, then `docsRoot` should be set to the path of the VitePress root directory.
 *
 * e.g. the following file structure:
 *
 * <FileTree>
 *  <FileTree.File name="package.json" />
 *  <FileTree.File name="typedoc.json" />
 *  <FileTree.Folder name="docs" defaultOpen>
 *    <FileTree.Folder name=".vitepress" defaultOpen></FileTree.Folder>
 *      <FileTree.Folder name="typedoc-api" defaultOpen>
 *        <FileTree.File name="index.md" />
 *      </FileTree.Folder>
 *    </FileTree.Folder>
 * </FileTree>
 *
 * Requires the following config:
 *
 * ```json filename="typedoc.json"
 * {
 *    "out": "./docs/typedoc-api",
 *    "docsRoot": "./docs",
 * }
 * ```
 *
 * @omitExample
 */
export const docsRoot = {
  help: 'The path to the VitePress project root.',
  type: ParameterType.Path,
  defaultValue: './',
};

/**
 * **sidebar.autoConfiguration**
 *
 * Set to `false` to disable sidebar generation. Defaults to true.
 *
 * **sidebar.format**
 *
 * Enables backward compatibility with VuePress. Available options [`"vitepress"`, `"vuepress1"`, `"vuepress2"`]. Defaults to `"vitepress"`.
 *
 * **sidebar.collapsed**
 *
 * Determines if sidebar items with children are open or closed. Set `collapsed` to `false` to set sidebar items as open by default.
 *
 * https://vitepress.dev/reference/default-theme-sidebar#collapsible-sidebar-groups
 *
 * **sidebar.pretty**
 *
 * Pretty format the sidebar JSON.
 *
 */
export const sidebar = {
  help: 'Configures the autogenerated VitePress sidebar.',
  type: ParameterType.Mixed,
  defaultValue: DEFAULT_SIDEBAR_OPTIONS,
};
