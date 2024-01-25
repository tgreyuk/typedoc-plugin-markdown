// THIS FILE IS AUTO GENERATED FROM THE OPTIONS CONFIG. DO NOT EDIT DIRECTLY.

import { ManuallyValidatedOption } from 'typedoc';

declare module 'typedoc' {
  export interface TypeDocOptionMap {
    frontmatterCommentTags: any[];
    frontmatterGlobals: ManuallyValidatedOption<FrontmatterGlobals>;
    frontmatterNamingConvention: 'camelCase' | 'snakeCase';
    preserveFrontmatterCommentTags: boolean;
  }
}

export interface PluginOptions {
  frontmatterCommentTags: any[];
  frontmatterGlobals: ManuallyValidatedOption<FrontmatterGlobals>;
  frontmatterNamingConvention: 'camelCase' | 'snakeCase';
  preserveFrontmatterCommentTags: boolean;
}

export interface FrontmatterGlobals {}
