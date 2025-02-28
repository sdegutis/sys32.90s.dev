import files from '../data/';
export default JSON.stringify(files.map(f => f.path));
