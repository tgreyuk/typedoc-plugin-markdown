import { DocsConfig } from '@dev-packages/helpers/src/models';
import * as fs from 'fs';
import * as path from 'path';
import { Project, VariableStatement } from 'ts-morph';
import { ParameterType } from 'typedoc';

export async function generateDocs(docsConfig: DocsConfig) {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });

  // PRESETS
  const out: string[] = [
    `import { Callout, FileTree } from 'nextra/components';`,
  ];
  out.push('# Options');
  out.push(
    'These are the additional options that can be added to the TypeDoc configuration.',
  );

  // DECLARATIONS
  if (docsConfig.declarations) {
    const declarationsConfig: any = await import(docsConfig.declarationsPath);
    const configFileTs = project.getSourceFile(docsConfig.declarationsPath);

    const optionsVariableStatements =
      configFileTs?.getVariableStatements() as VariableStatement[];

    const parsedConfig = Object.entries(declarationsConfig).map(
      ([name, option]: any, i) => {
        const docs = optionsVariableStatements[i].getJsDocs().map((doc) => {
          return {
            comments: (doc.getComment() as string)
              ?.replace(/\\\//g, '/')
              .replace(/\\@/g, '@'),
            tags: doc
              .getTags()
              .filter(
                (tag) =>
                  tag.getTagName() !== 'deprecated' &&
                  tag.getTagName() !== 'category' &&
                  tag.getTagName() !== 'omitExample' &&
                  tag.getTagName() !== 'example',
              )
              .map((tag) => ({
                name: tag.getTagName(),
                comments: tag.getComment(),
              })),
            omitExample: Boolean(
              doc.getTags().find((tag) => tag.getTagName() === 'omitExample'),
            ),
            example: doc
              .getTags()
              .find((tag) => tag.getTagName() === 'example')
              ?.getComment(),
            deprecated: doc
              .getTags()
              .find((tag) => tag.getTagName() === 'deprecated')
              ?.getComment(),
            category:
              doc
                .getTags()
                .find((tag) => tag.getTagName() === 'category')
                ?.getComment() || 'other',
          };
        })[0];
        return {
          name,
          ...option,
          ...(docs ? docs : { category: 'other' }),
        };
      },
    );

    const groupedConfig: Record<string, any> = groupBy(
      parsedConfig,
      'category',
    );

    const categories = Object.entries(groupedConfig);

    categories.forEach(([categoryName, options]) => {
      const optionLevel = categories.length === 1 ? '##' : '###';
      if (categories.length > 1) {
        out.push(`## ${getDocsTitle(categoryName)}`);
      }
      options.forEach((option) => {
        out.push(
          `${optionLevel} ${
            Boolean(option.deprecated) ? `~${option.name}~` : `${option.name}`
          }`,
        );
        if (Boolean(option.deprecated)) {
          out.push(
            `<Callout type="warning">Deprecated - ${option.deprecated}</Callout>`,
          );
        } else {
          out.push(`<Callout>${option.help}</Callout>`);
        }
        const meta: string[] = [];
        const type = getType(option);
        if (type) {
          meta.push(type);
        }
        if (
          option.type !== ParameterType.Array &&
          option.type !== ParameterType.Mixed
        ) {
          meta.push(`Defaults to \`${getDefaultValue(option)}\`.`);
        }
        out.push(`> ${meta.join(' ')}`);

        if (option.comments?.length) {
          out.push(option.comments);
          option.tags?.forEach((tag) => {
            out.push(`**${tag.name}**`);
            out.push(tag.comments);
          });
        }

        if (!option.omitExample) {
          if (
            !option.example &&
            option.type === ParameterType.Mixed &&
            (!Array.isArray(option.defaultValue) || option.defaultValue?.length)
          ) {
            out.push('Below is the full list of keys and default values:');
          }

          out.push(`
\`\`\`json filename="typedoc.json"
${JSON.stringify(
  JSON.parse(`{
  "${option.name}": ${getExampleValue(option)}
}`),
  null,
  2,
)}

\`\`\``);
        }
        out.push('___');
      });
    });
  }

  const optionDocPath = path.join(
    getDocsPath(docsConfig.docsPath),
    'options.mdx',
  );

  fs.writeFileSync(optionDocPath, out.join('\n\n'));
}

function getType(option: any) {
  if (option.type === ParameterType.Array && option.defaultValue) {
    return `Accepts an array of the following values ${option.defaultValue
      .toString()
      .split(',')
      .map((item) => `\`"${item}"\``)
      .join(' ')}.`;
  }

  if (option.type === ParameterType.String) {
    return 'Accepts a string value.';
  }

  if (option.type === ParameterType.Boolean) {
    return 'Accepts a boolean value.';
  }

  if (option.type === ParameterType.Array) {
    return 'Accepts an Array.';
  }

  if (option.type === ParameterType.Mixed && option.defaultValue) {
    return Array.isArray(option.defaultValue)
      ? 'Accepts an Array.'
      : 'Accepts a key/value object.';
  }

  if (option.type === ParameterType.Map && option.map) {
    const values = Object.values(option.map);
    return `Accepts ${values.length === 2 ? 'either' : 'one of'} ${values
      .map((value) => `\`"${value}"\``)
      .join(` ${values.length === 2 ? 'or' : '|'} `)}.`;
  }
  return null;
}

function getDefaultValue(option) {
  if (option.type === ParameterType.Boolean) {
    return option.defaultValue;
  }
  if (option.type === ParameterType.Flags) {
    return JSON.stringify(option.defaults);
  }
  if (option.type === ParameterType.Array) {
    return '';
  }
  if (option.type === ParameterType.Mixed) {
    return JSON.stringify(option.defaultValue);
  }
  return `"${option.defaultValue}"`;
}

function getExampleValue(option) {
  if (option.example) {
    return option.example;
  }
  return getDefaultValue(option);
}

function getDocsPath(docsPath: string) {
  const pagesPath = path.join(path.resolve(), '..', '..', 'docs', 'pages');
  return path.join(pagesPath, docsPath);
}

function getDocsTitle(categoryName: string) {
  return categoryName === 'other'
    ? `Plugin Options`
    : `${categoryName} Options`;
}

function groupBy(array: any[], key: string) {
  return array.reduce(
    (r, v, i, a, k = v[key]) => ((r[k] || (r[k] = [])).push(v), r),
    {},
  );
}
