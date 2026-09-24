const fs = require('fs');

function applyRegexFixes(path, fixes) {
    let content = fs.readFileSync(path, 'utf8');
    for (let [search, replace] of fixes) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content);
}

applyRegexFixes('frontend/src/App.tsx', [
    [/Bienvenido a RackDraw/g, '{t("app.welcome")}'],
    [/Gestión Inteligente de Racks/g, '{t("app.tagline")}'],
    [/Distribución Física del Rack \(Con Cableado\)/g, '{t("app.rackLayoutWith")}'],
    [/Crea o selecciona un proyecto en el menú de la izquierda, luego abre un rack para comenzar a montar y cablear equipos\./g, '{t("app.welcomeMsg")}'],
    [/Solo Selección/g, '{t("app.selectionOnly")}'],
    [/Distribución Física del Rack \(Sin Cableado\)/g, '{t("app.rackLayoutWithout")}'],
    [/Memoria Técnica de Infraestructura \(RackDraw Report\)/g, '{t("app.reportTitle")}']
]);

applyRegexFixes('frontend/src/components/layout/Sidebar.tsx', [
    [/Eliminar Proyecto/g, '{t("sidebar.deleteProject")}']
]);

applyRegexFixes('frontend/src/components/rackface/RackfaceGrid.tsx', [
    [/<Edit3 size=\{10\} \/> Editar/g, '<Edit3 size={10} /> {t("rackface.edit")}'],
    [/<Copy size=\{10\} \/> Clonar/g, '<Copy size={10} /> {t("rackface.clone")}'],
    [/title="Editar equipo"/g, 'title={t("rackface.edit")}']
]);

applyRegexFixes('frontend/src/components/layout/WireListPanel.tsx', [
    [/Cerrar/g, '{t("wirelist.close")}'],
    [/<Edit3 size=\{14\} \/> Editar Equipo \/ Puertos/g, '<Edit3 size={14} /> {t("rackface.editEquipPorts")}']
]);

// update i18n.ts
let i18n = fs.readFileSync('frontend/src/i18n.ts', 'utf8');
i18n = i18n.replace(
  '"dockerActive": "Docker Active",',
  '"dockerActive": "Docker Active",\n        "welcome": "Welcome to RackDraw",'
);
i18n = i18n.replace(
  '"dockerActive": "Docker Activo",',
  '"dockerActive": "Docker Activo",\n        "welcome": "Bienvenido a RackDraw",'
);
fs.writeFileSync('frontend/src/i18n.ts', i18n);

console.log('Fixed stragglers.');
