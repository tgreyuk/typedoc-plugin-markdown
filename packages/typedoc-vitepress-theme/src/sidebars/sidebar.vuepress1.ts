import { NavigationItem } from 'typedoc-plugin-markdown';

export default (navigation: NavigationItem[], basePath: string) => {
  return navigation?.map((navigationItem) => {
    return getNavigationItem(navigationItem, basePath);
  });
};

function getNavigationItem(navigationItem: NavigationItem, basePath: string) {
  return {
    title: navigationItem.title,
    sidebarDepth: 0,
    path: navigationItem.url
      ? `/${basePath}/${getUrlKey(navigationItem.url as string)}`
      : null,
    children: navigationItem?.children?.map((groupChild) => {
      return getNavigationItem(groupChild, basePath);
    }),
  };
}

function getUrlKey(url: string) {
  return url.replace('.md', '');
}
