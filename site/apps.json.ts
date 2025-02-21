import files from './apps/';
export default JSON.stringify(files.map(f => f.path));
