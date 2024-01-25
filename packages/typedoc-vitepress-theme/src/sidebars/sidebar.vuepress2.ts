import { NavigationItem } from 'typedoc-plugin-markdown';

export default (navigation: NavigationItem[], basePath: string) => {
  return navigation.map((navigationItem) => {
    return getNavigationItem(navigationItem, basePath);
  });
};

function getNavigationItem(navigationItem: NavigationItem, basePath: string) {
  return {
    text: navigationItem.title,
    link: navigationItem.url ? `/${basePath}/${navigationItem.url}` : null,
    collapsible: true,
    children: navigationItem?.children?.map((group) => {
      return getNavigationItem(group, basePath);
    }),
  };
}
