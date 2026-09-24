const fs = require('fs');

let c = fs.readFileSync('frontend/src/components/layout/WireListPanel.tsx', 'utf8');

c = c.replace(/Editar Equipo:/g, '{t("rackface.editDevice")}:');
c = c.replace(/Detalles del Chasis/g, '{t("rackface.chassisDetails")}');
c = c.replace(/Marca \/ Fabricante/g, '{t("rackface.brand")}');
c = c.replace(/Nombre de Red/g, '{t("rackface.networkName")}');
c = c.replace(/<label style=\{\{ fontSize: '0.75rem', color: 'var\(--text-secondary\)' \}\}>Modelo<\/label>/g, "<label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t(\"rackface.model\")}</label>");
c = c.replace(/<label style=\{\{ fontSize: '0.75rem', color: 'var\(--text-secondary\)' \}\}>Altura \(U\)<\/label>/g, "<label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t(\"rackface.heightU\")}</label>");
c = c.replace(/Color de Tarjeta \(Lateral\)/g, '{t("rackface.color")}');
c = c.replace(/Agregar Nueva Interfaz:/g, '{t("rackface.addNewInterface")}');
c = c.replace(/placeholder="Nombre \(ej\. Gi1\/0\/2\)"/g, 'placeholder={t("rackface.nameEj")}');
c = c.replace(/<Plus size=\{13\} \/> Agregar Puerto/g, '<Plus size={13} /> {t("rackface.addPort")}');

fs.writeFileSync('frontend/src/components/layout/WireListPanel.tsx', c);

let i18n = fs.readFileSync('frontend/src/i18n.ts', 'utf8');
i18n = i18n.replace(
  '"devName": "Device Name",',
  '"devName": "Device Name",\n        "networkName": "Network Name",'
);
i18n = i18n.replace(
  '"devName": "Nombre de Equipo",',
  '"devName": "Nombre de Equipo",\n        "networkName": "Nombre de Red",'
);
fs.writeFileSync('frontend/src/i18n.ts', i18n);

console.log('Fixed WireListPanel device edit strings');
