import { Options, ReflectionKind } from 'typedoc';
import { TextContentMappings } from '../../plugin/options/option-types.js';
import {
  PLURAL_KIND_KEY_MAP,
  SINGULAR_KIND_KEY_MAP,
  TEXT_MAPPING_DEFAULTS,
} from '../../plugin/options/text-mappings/index.js';

export const text = (options: Options) => {
  const textFromOptions = options.getValue('textContentMappings');
  const textMappings = { ...TEXT_MAPPING_DEFAULTS, ...(textFromOptions || {}) };
  return {
    /**
     *
     * @param key The key of the text mapping to get.
     * @returns
     */
    get: (key: keyof TextContentMappings) => {
      return textMappings[key];
    },
    groupTitle(title: string) {
      const key = PLURAL_KIND_KEY_MAP[title] as keyof TextContentMappings;
      return this.get(key) || title;
    },
    kindString(kind: ReflectionKind) {
      const singularString = ReflectionKind.singularString(kind);
      const key = SINGULAR_KIND_KEY_MAP[
        singularString
      ] as keyof TextContentMappings;
      return this.get(key) || singularString;
    },
    indexTitle(textContent: string, name: string, version?: string) {
      return textContent
        .replace('{projectName}', name)
        .replace('{version}', version ? `v${version}` : '')
        .replace(/\s+/g, ' ')
        .trim();
    },
  };
};
