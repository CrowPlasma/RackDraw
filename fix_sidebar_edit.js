const fs = require('fs');

let c = fs.readFileSync('frontend/src/components/layout/Sidebar.tsx', 'utf8');

c = c.replace(/Nombre del Rack/g, '{t("sidebar.rackName")}');
c = c.replace(/Nombre del Proyecto/g, '{t("sidebar.projectName")}'); // Just in case it's in the Edit Project modal too

fs.writeFileSync('frontend/src/components/layout/Sidebar.tsx', c);

console.log('Fixed Sidebar stray names');
