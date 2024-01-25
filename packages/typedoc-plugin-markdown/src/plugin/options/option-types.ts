// THIS FILE IS AUTO GENERATED FROM THE OPTIONS CONFIG. DO NOT EDIT DIRECTLY.

import { ManuallyValidatedOption } from 'typedoc';

declare module 'typedoc' {
  export interface TypeDocOptionMap {
    anchorPrefix: string;
    entryFileName: string;
    entryModule: string;
    enumMembersFormat: 'list' | 'table';
    excludeGroups: boolean;
    expandObjects: boolean;
    hideBreadcrumbs: boolean;
    hideInPageTOC: boolean;
    hidePageHeader: boolean;
    hidePageTitle: boolean;
    indexFormat: 'list' | 'table';
    indexPageTitle: string;
    memberPageTitle: string;
    mergeReadme: boolean;
    namedAnchors: boolean;
    outputFileStrategy: 'members' | 'modules';
    parametersFormat: 'list' | 'table';
    preserveAnchorCasing: boolean;
    propertiesFormat: 'list' | 'table';
    publicPath: string;
    textContentMappings: ManuallyValidatedOption<TextContentMappings>;
    typeDeclarationFormat: 'list' | 'table';
    useCodeBlocks: boolean;
  }
}

export interface PluginOptions {
  anchorPrefix: string;
  entryFileName: string;
  entryModule: string;
  enumMembersFormat: 'list' | 'table';
  excludeGroups: boolean;
  expandObjects: boolean;
  hideBreadcrumbs: boolean;
  hideInPageTOC: boolean;
  hidePageHeader: boolean;
  hidePageTitle: boolean;
  indexFormat: 'list' | 'table';
  indexPageTitle: string;
  memberPageTitle: string;
  mergeReadme: boolean;
  namedAnchors: boolean;
  outputFileStrategy: 'members' | 'modules';
  parametersFormat: 'list' | 'table';
  preserveAnchorCasing: boolean;
  propertiesFormat: 'list' | 'table';
  publicPath: string;
  textContentMappings: ManuallyValidatedOption<TextContentMappings>;
  typeDeclarationFormat: 'list' | 'table';
  useCodeBlocks: boolean;
}

export interface TextContentMappings {
  'header.title': string;
  'header.readme': string;
  'header.docs': string;
  'breadcrumbs.home': string;
  'footer.generator': string;
  'title.indexPage': string;
  'title.modulePage': string;
  'title.memberPage': string;
  'title.member': string;
  'label.defaultValue': string;
  'label.description': string;
  'label.extendedBy': string;
  'label.extends': string;
  'label.globals': string;
  'label.implements': string;
  'label.implementationOf': string;
  'label.inheritedFrom': string;
  'label.index': string;
  'label.indexable': string;
  'label.indexSignature': string;
  'label.member': string;
  'label.modifier': string;
  'label.overrides': string;
  'label.packages': string;
  'label.reExports': string;
  'label.renamesAndReExports': string;
  'label.returns': string;
  'label.source': string;
  'label.type': string;
  'label.typeDeclaration': string;
  'label.value': string;
  'kind.class.singular': string;
  'kind.class.plural': string;
  'kind.constructor.singular': string;
  'kind.constructor.plural': string;
  'kind.enum.singular': string;
  'kind.enum.plural': string;
  'kind.enumMember.singular': string;
  'kind.enumMember.plural': string;
  'kind.event.singular': string;
  'kind.event.plural': string;
  'kind.function.singular': string;
  'kind.function.plural': string;
  'kind.interface.singular': string;
  'kind.interface.plural': string;
  'kind.method.singular': string;
  'kind.method.plural': string;
  'kind.module.singular': string;
  'kind.module.plural': string;
  'kind.namespace.singular': string;
  'kind.namespace.plural': string;
  'kind.variable.singular': string;
  'kind.variable.plural': string;
  'kind.parameter.singular': string;
  'kind.parameter.plural': string;
  'kind.property.singular': string;
  'kind.property.plural': string;
  'kind.reference.singular': string;
  'kind.reference.plural': string;
  'kind.typeAlias.singular': string;
  'kind.typeAlias.plural': string;
  'kind.typeParameter.singular': string;
  'kind.typeParameter.plural': string;
}
