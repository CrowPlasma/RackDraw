const fs = require('fs');

function applyRegexFixes(path, fixes) {
    let content = fs.readFileSync(path, 'utf8');
    for (let [search, replace] of fixes) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content);
}

applyRegexFixes('frontend/src/components/layout/Sidebar.tsx', [
    [/Esta acción no se puede deshacer/g, '{t("wirelist.cannotUndo")}']
]);

applyRegexFixes('frontend/src/components/ui/ConnectionModal.tsx', [
    [/Mapear Nueva Conexión/g, '{t("connection.mapNew")}'],
    [/Línea de Energía/g, 'Power Line'],
    [/Etiqueta física \(Opcional\)/g, '{t("connection.physicalLabel")}'],
    [/Confirmar Conexión/g, '{t("connection.confirm")}']
]);

let appContent = fs.readFileSync('frontend/src/App.tsx', 'utf8');
if (!appContent.includes('useTranslation')) {
    appContent = appContent.replace("import { useRackStore", "import { useTranslation } from 'react-i18next';\nimport { useRackStore");
    appContent = appContent.replace("function App() {", "function App() {\n  const { t } = useTranslation();");
}
appContent = appContent.replace(/Gestión Inteligente de Racks/g, '{t("app.tagline")}');
appContent = appContent.replace(/Imprimir Memoria Técnica \(PDF\)/g, '{t("app.printPdf")}');
appContent = appContent.replace(/Distribución Física del Rack \(Con Cableado\)/g, '{t("app.rackLayoutWith")}');
appContent = appContent.replace(/Crea o selecciona un proyecto en el menú de la izquierda, luego abre un rack para comenzar a montar y cablear equipos\./g, '{t("app.welcomeMsg")}');
appContent = appContent.replace(/Solo Selección/g, '{t("app.selectionOnly")}');
appContent = appContent.replace(/Distribución Física del Rack \(Sin Cableado\)/g, '{t("app.rackLayoutWithout")}');
appContent = appContent.replace(/Memoria Técnica de Infraestructura \(RackDraw Report\)/g, '{t("app.reportTitle")}');
appContent = appContent.replace(/Descripción del Proyecto:/g, '{t("app.projectDesc")}');
appContent = appContent.replace(/Fecha de Emisión:/g, '{t("app.issueDate")}');
fs.writeFileSync('frontend/src/App.tsx', appContent);

let storeContent = fs.readFileSync('frontend/src/store/useRackStore.ts', 'utf8');
storeContent = storeContent.replace(/Cable instalado con éxito\./g, 'Cable installed successfully.');
storeContent = storeContent.replace(/Cable modificado con éxito\./g, 'Cable modified successfully.');
fs.writeFileSync('frontend/src/store/useRackStore.ts', storeContent);

// Add to i18n
let i18n = fs.readFileSync('frontend/src/i18n.ts', 'utf8');
i18n = i18n.replace(
  '"dockerActive": "Docker Active",',
  '"dockerActive": "Docker Active",\n        "tagline": "Intelligent Rack Management",\n        "printPdf": "Print Technical Report (PDF)",\n        "rackLayoutWith": "Physical Rack Layout (With Cabling)",\n        "welcomeMsg": "Create or select a project in the left menu, then open a rack to start mounting and cabling equipment.",\n        "selectionOnly": "Selection Only",\n        "rackLayoutWithout": "Physical Rack Layout (Without Cabling)",\n        "reportTitle": "Infrastructure Technical Report (RackDraw Report)",\n        "projectDesc": "Project Description:",\n        "issueDate": "Issue Date:",'
);
i18n = i18n.replace(
  '"dockerActive": "Docker Activo",',
  '"dockerActive": "Docker Activo",\n        "tagline": "Gestión Inteligente de Racks",\n        "printPdf": "Imprimir Memoria Técnica (PDF)",\n        "rackLayoutWith": "Distribución Física del Rack (Con Cableado)",\n        "welcomeMsg": "Crea o selecciona un proyecto en el menú de la izquierda, luego abre un rack para comenzar a montar y cablear equipos.",\n        "selectionOnly": "Solo Selección",\n        "rackLayoutWithout": "Distribución Física del Rack (Sin Cableado)",\n        "reportTitle": "Memoria Técnica de Infraestructura (RackDraw Report)",\n        "projectDesc": "Descripción del Proyecto:",\n        "issueDate": "Fecha de Emisión:",'
);
i18n = i18n.replace(
  '"actual": "(Current)"',
  '"actual": "(Current)",\n        "mapNew": "Map New Connection",\n        "physicalLabel": "Physical Label (Optional)",\n        "confirm": "Confirm Connection"'
);
i18n = i18n.replace(
  '"actual": "(Actual)"',
  '"actual": "(Actual)",\n        "mapNew": "Mapear Nueva Conexión",\n        "physicalLabel": "Etiqueta física (Opcional)",\n        "confirm": "Confirmar Conexión"'
);
fs.writeFileSync('frontend/src/i18n.ts', i18n);

console.log('Fixed final strings.');
