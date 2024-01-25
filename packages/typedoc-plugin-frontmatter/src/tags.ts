import { Comment, CommentTag } from 'typedoc';
import { FrontmatterNamingConvention } from './options/maps.js';

export function getFrontmatterTags(
  comment: Comment,
  frontmatterTags: string[],
  namingConvention: FrontmatterNamingConvention,
) {
  if (comment.blockTags?.length) {
    const tags = comment.blockTags
      .filter((tag) => frontmatterTags?.includes(getTagName(tag)))
      .reduce((prev, current) => {
        const tagName = getTagName(current);
        const tagValue = current.content
          .filter((commentPart) => commentPart.kind === 'text')
          .map((commentPart) => commentPart.text, false)
          .join('\n');
        return {
          ...prev,
          [toVariable(tagName, namingConvention)]: isNaN(Number(tagValue))
            ? tagValue
            : Number(tagValue),
        };
      }, {});
    return tags;
  }
  return {};
}

function getTagName(tag: CommentTag) {
  return tag.tag.substring(1);
}

function toVariable(
  key: string,
  namingConvention: FrontmatterNamingConvention,
) {
  if (namingConvention === FrontmatterNamingConvention.SnakeCase) {
    return toSnakeCase(key);
  }
  return key;
}

function toSnakeCase(key: string) {
  return (
    key
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
      )
      ?.map((s) => s.toLowerCase())
      .join('_') || ''
  );
}
