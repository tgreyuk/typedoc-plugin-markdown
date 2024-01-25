import * as path from 'path';
import { NavigationItem } from 'typedoc-plugin-markdown';
import { Sidebar } from '../options/models.js';

export default (
  navigation: NavigationItem[],
  basePath: string,
  options: Sidebar,
) => {
  return navigation.map((navigationItem) => {
    return getNavigationItem(navigationItem, basePath, options);
  });
};

function getNavigationItem(
  navigationItem: NavigationItem,
  basePath: string,
  options: Sidebar,
) {
  const hasChildren = navigationItem?.children?.length;

  return {
    text: navigationItem.title,
    ...(Boolean(navigationItem?.url) && {
      link: `/${basePath}/${getParsedUrl(navigationItem.url as string)}`,
    }),
    ...(hasChildren && { collapsed: options.collapsed }),
    ...(hasChildren && {
      items: navigationItem.children?.map((group) =>
        getNavigationItem(group, basePath, options),
      ),
    }),
  };
}

function getParsedUrl(url: string) {
  if (path.basename(url) === 'index.md') {
    return path.dirname(url) + '/';
  }
  return url;
}
