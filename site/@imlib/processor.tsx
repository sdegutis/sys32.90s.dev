import { processFile, type SiteProcessor } from "@imlib/core";

const copyright = `Copyright ©️ ${new Date().getFullYear()} Novo Cantico LLC. All rights reserved.`;

export default (({ inFiles, outFiles }) => {
  const files = [...inFiles];

  const preloadfetch = (files
    .map(f => f.path)
    .filter(s => s.startsWith('/os/data/'))
    .toSpliced(0, 0, '/os/fs/data.json')
    .map(s => `  <link rel="preload" as="fetch" href="${s}" crossorigin="anonymous" />`)
    .join('\n'));

  console.log(preloadfetch)

  const preload = (files
    .map(f => f.path)
    .filter(s => s.endsWith('.js'))
    .filter(s => !s.includes('@imlib'))
    .filter(s => !s.includes('.json.'))
    .map(s => `  <link rel="modulepreload" href="${s}" />`)
    .join('\n'));

  function insert(s: string) {
    return s.replace('<head>', `<head>\n${preload}\n${preloadfetch}\n`);
  }

  for (const file of files) {
    for (let { path, content } of processFile(file)) {
      if (path.endsWith('.js')) content = `/** ${copyright} */\n` + content.toString('utf8');
      if (path.endsWith('.html')) content = `<!-- ${copyright} -->\n` + insert(content.toString('utf8'));
      outFiles.set(path, content);
    }
  }
}) as SiteProcessor;
