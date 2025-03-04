import { jsxToString, processFile, type SiteProcessor } from "@imlib/core";

const copyright = `Copyright ©️ ${new Date().getFullYear()} Novo Cantico LLC. All rights reserved.`;

const icon = jsxToString(<link
  rel="shortcut icon"
  href={`data:image/svg+xml,${encodeURIComponent(jsxToString(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M10 2 L10 30 24 16 Z" fill="#19f" />
    </svg>
  ))}`}
/>);

export default (({ inFiles, outFiles }) => {
  const files = [...inFiles];

  const preloadfetch = (files
    .map(f => f.path)
    .filter(s => s.startsWith('/os/data/'))
    .toSpliced(0, 0, '/os/fs/data.json')
    .map(s => `  <link rel="preload" as="fetch" href="${s}" />`)
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
    return s.replace('<head>', `<head>\n${preload}\n${preloadfetch}\n  ${icon}`);
  }

  for (const file of files) {
    for (let { path, content } of processFile(file)) {
      if (path.endsWith('.js')) content = `/** ${copyright} */\n` + content.toString('utf8');
      if (path.endsWith('.html')) content = `<!-- ${copyright} -->\n` + insert(content.toString('utf8'));
      outFiles.set(path, content);
    }
  }
}) as SiteProcessor;
