const fs = require('fs');

// Fix Horas.tsx
let horasFile = 'src/pages/Horas.tsx';
let horasContent = fs.readFileSync(horasFile, 'utf8');
horasContent = horasContent.replace('const rows = [];', 'const rows: any[] = [];');
horasContent = horasContent.replace('didDrawPage: (data) =>', 'didDrawPage: (data: any) =>');
fs.writeFileSync(horasFile, horasContent);

// Fix Reports.tsx
let reportsFile = 'src/pages/Reports.tsx';
let reportsContent = fs.readFileSync(reportsFile, 'utf8');
reportsContent = reportsContent.replace('const addSectionTitle = (title) =>', 'const addSectionTitle = (title: string) =>');
reportsContent = reportsContent.replace(/didDrawPage: \(data\) => \{ y = data\.cursor\.y \+ 5; \}/g, 'didDrawPage: (data: any) => { if (data.cursor) y = data.cursor.y + 5; }');
reportsContent = reportsContent.replace(/(b\.date \+ )s(\.startTime)/g, '$1b$2');
reportsContent = reportsContent.replace('const pageCount = doc.internal.getNumberOfPages();', 'const pageCount = (doc as any).internal.getNumberOfPages();');
reportsContent = reportsContent.replace(
  "d.status === 'missed' ? (d.observations || '') : ''",
  "d.status === 'missed' ? (d.observations || '') : ''"
); // To fix the undefined issue, we need to ensure all map elements are explicitly strings.
// Let's replace the whole tableData mapping for 'tomas' to cast to string[]
reportsContent = reportsContent.replace(
  'return [',
  'return (['
);
reportsContent = reportsContent.replace(
  "d.status === 'missed' ? (d.observations || '') : ''\n              ];",
  "d.status === 'missed' ? (d.observations || '') : ''\n              ] as string[]);"
);

fs.writeFileSync(reportsFile, reportsContent);
