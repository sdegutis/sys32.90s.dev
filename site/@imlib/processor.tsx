import { jsxToString, processFile, type SiteProcessor } from "@imlib/core";

const copyright = `Copyright ©️ ${new Date().getFullYear()} Novo Cantico LLC. All rights reserved.`;

export default (({ inFiles, outFiles }) => {
  const files = [...inFiles];

  const preload = (files
    .map(f => f.path)
    .filter(s => s.endsWith('.js'))
    .filter(s => !s.includes('@imlib'))
    .filter(s => !s.includes('.json.'))
    .map(s => `  <link rel="modulepreload" href="${s}" />`)
    .join('\n'));

  function insert(s: string) {
    const icon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M10 2 L10 30 24 16 Z" fill="#19f" />
    </svg>;
    const href = `data:image/svg+xml,${encodeURIComponent(jsxToString(icon))}`;
    const iconlink = jsxToString(<link rel="shortcut icon" href={href} />);
    return s.replace('<head>', `<head>\n${preload}\n  ${iconlink}`);
  }

  for (const file of files) {
    for (let { path, content } of processFile(file)) {
      if (path.endsWith('.js')) content = `/** ${copyright} */\n` + content.toString('utf8');
      if (path.endsWith('.html')) content = `<!-- ${copyright} -->\n` + insert(content.toString('utf8'));
      outFiles.set(path, content);
    }
  }
}) as SiteProcessor;
