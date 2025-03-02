import { processFile, type SiteProcessor } from "@imlib/core";

const copyright = `Copyright ©️ ${new Date().getFullYear()} Novo Cantico LLC. All rights reserved.`;

export default (({ inFiles, outFiles }) => {
  for (const file of inFiles) {
    for (let { path, content } of processFile(file)) {
      if (path.endsWith('.js')) content = `/** ${copyright} */\n` + content;
      if (path.endsWith('.html')) content = `<!-- ${copyright} -->\n` + content;
      outFiles.set(path, content);
    }
  }
}) as SiteProcessor;
