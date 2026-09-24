const fs = require('fs');

let c = fs.readFileSync('frontend/src/i18n.ts', 'utf8');
c = c.replace(
  '"startCabling": "Start Cabling from Here"',
  '"startCabling": "Start Cabling from Here",\n        "deletePort": "Delete Port",\n        "deletePortMsg": "Delete port",\n        "networkInterfaces": "Network Interfaces",\n        "noPorts": "No assigned ports"'
);

c = c.replace(
  '"startCabling": "Iniciar Cableado desde Aquí"',
  '"startCabling": "Iniciar Cableado desde Aquí",\n        "deletePort": "Eliminar Puerto",\n        "deletePortMsg": "¿Eliminar el puerto ",\n        "networkInterfaces": "Interfaces de Red",\n        "noPorts": "Sin puertos asignados"'
);

fs.writeFileSync('frontend/src/i18n.ts', c);

let w = fs.readFileSync('frontend/src/components/layout/WireListPanel.tsx', 'utf8');
w = w.replace("Eliminar Puerto</h3>", '{t("wirelist.deletePort")}</h3>');
w = w.replace("Esta acción no se puede deshacer</span>", '{t("wirelist.cannotUndo")}</span>');
w = w.replace("¿Eliminar el puerto", '{t("wirelist.deletePortMsg")}');
w = w.replace("Interfaces de Red ", '{t("wirelist.networkInterfaces")} ');
w = w.replace("Sin puertos asignados", '{t("wirelist.noPorts")}');
w = w.replace("¿Desconectar y retirar este cable del rack? Los puertos quedarán disponibles para nuevas conexiones.", '{t("wirelist.disconnectPrompt")}');
fs.writeFileSync('frontend/src/components/layout/WireListPanel.tsx', w);

let s = fs.readFileSync('frontend/src/components/layout/Sidebar.tsx', 'utf8');
s = s.replace("¿Estás seguro de eliminar el proyecto ", '{t("sidebar.deleteProjectMsg")} ');
s = s.replace("¿Estás seguro de eliminar el rack ", '{t("sidebar.confirmDelete")} ');
fs.writeFileSync('frontend/src/components/layout/Sidebar.tsx', s);

console.log('Fixed edge cases');
