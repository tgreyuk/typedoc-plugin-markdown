import { remark } from 'remark';
import { read, writeSync } from 'to-vfile';

export async function parseContents(filePath: string, plugins = []) {
  const file = await read(filePath);
  const processor = remark();
  if (plugins.length > 0) {
    const promises = plugins.map(async (plugin) => {
      return new Promise((resolve) => {
        const name = Array.isArray(plugin) ? plugin[0] : plugin;
        const options = Array.isArray(plugin) ? plugin[1] : {};
        import(name).then(({ default: pluginFn }) => {
          resolve({
            pluginFn,
            options,
          });
        });
      });
    });

    const pluginRefs = (await Promise.all(promises)) as any;

    pluginRefs.forEach((pluginRef) => {
      processor.use(pluginRef.pluginFn, pluginRef.options);
    });
  }

  processor.processSync(file);

  writeSync(file);
}
