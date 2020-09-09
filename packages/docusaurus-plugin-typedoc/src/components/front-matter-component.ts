import { NavigationItem, Renderer } from 'typedoc';
import { FrontMatterComponent } from 'typedoc-plugin-markdown/dist/components/front-matter.component';
import { Component } from 'typedoc/dist/lib/output/components';
import { PageEvent } from 'typedoc/dist/lib/output/events';
import { SidebarOptions } from '../types';

@Component({ name: 'docusaurus-frontmatter' })
export class DocsaurusFrontMatterComponent extends FrontMatterComponent {
  sidebar: SidebarOptions;
  constructor(owner: Renderer, sidebar: SidebarOptions) {
    super(owner);
    this.sidebar = sidebar;
  }
  getYamlItems(page: PageEvent) {
    return {
      ...this.getDefaultValues(page),
      ...{
        ...(this.sidebar && {
          sidebar_label: this.getSidebarLabel(page),
        }),
        hide_title: true,
        hide_table_of_contents: page.url === page.project.url,
      },
    };
  }

  getSidebarLabel(page: PageEvent) {
    if (page.model.name === page.project.name) {
      return page.url === page.project.url ? 'Globals' : 'README';
    }

    const item = this.findNavigationItem(
      page.navigation.children,
      page.url,
      null,
    );

    const getShortName = (title: string) => {
      const longTitle = title.split('.');
      return longTitle[longTitle.length - 1];
    };

    if (item) {
      return this.sidebar.fullNames ? item.title : getShortName(item.title);
    }
    return page.model.name;
  }

  findNavigationItem(
    navigation: NavigationItem[],
    url: string,
    item: NavigationItem,
  ) {
    navigation.forEach((navigationChild) => {
      if (navigationChild.url === url) {
        item = navigationChild;
        return;
      }
      if (navigationChild.children) {
        item = this.findNavigationItem(navigationChild.children, url, item);
      }
    });
    return item;
  }
}