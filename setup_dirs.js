import fs from 'fs';
import path from 'path';

const dirs = [
  'src/components/layout',
  'src/components/ui',
  'src/pages',
  'src/store',
  'src/types',
  'src/lib',
  'src/assets'
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true });
});

console.log("Directories created successfully.");
