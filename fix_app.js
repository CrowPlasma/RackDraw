const fs = require('fs');

let appContent = fs.readFileSync('frontend/src/App.tsx', 'utf8');

// Ensure useTranslation is imported
if (!appContent.includes("import { useTranslation } from 'react-i18next';")) {
    appContent = appContent.replace("import { useRackStore", "import { useTranslation } from 'react-i18next';\nimport { useRackStore");
    appContent = appContent.replace("function App() {", "function App() {\n  const { t } = useTranslation();");
}

appContent = appContent.replace(/title="Imprimir Memoria Técnica \(PDF\)"/g, 'title={t("app.printPdf")}');
appContent = appContent.replace(/>Distribución Física del Rack \(Con Cableado\)/g, '>{t("app.rackLayoutWith")}');
appContent = appContent.replace(/>Solo Selección/g, '>{t("app.selectionOnly")}');
appContent = appContent.replace(/>Distribución Física del Rack \(Sin Cableado\)/g, '>{t("app.rackLayoutWithout")}');
appContent = appContent.replace(/>Memoria Técnica de Infraestructura \(RackDraw Report\)/g, '>{t("app.reportTitle")}');
appContent = appContent.replace(/>Gestión Inteligente de Racks/g, '>{t("app.tagline")}');
appContent = appContent.replace(/>Descripción del Proyecto:<\/strong>/g, '>{t("app.projectDesc")}</strong>');
appContent = appContent.replace(/>Fecha de Emisión:<\/strong>/g, '>{t("app.issueDate")}</strong>');
appContent = appContent.replace(/>Crea o selecciona un proyecto en el menú de la izquierda, luego abre un rack para comenzar a montar y cablear equipos\./g, '>{t("app.welcomeMsg")}');

fs.writeFileSync('frontend/src/App.tsx', appContent);
console.log('Fixed App.tsx safely.');
