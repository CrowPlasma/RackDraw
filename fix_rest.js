const fs = require('fs');

let i18n = fs.readFileSync('frontend/src/i18n.ts', 'utf8');

i18n = i18n.replace(
  '"dockerActive": "Docker Active",',
  `"dockerActive": "Docker Active",
        "origin": "Origin: ",
        "selectDest": "• Select destination port.",
        "viewAll": "View All",`
);

i18n = i18n.replace(
  '"dockerActive": "Docker Activo",',
  `"dockerActive": "Docker Activo",
        "origin": "Origen: ",
        "selectDest": "• Selecciona puerto destino.",
        "viewAll": "Ver Todo",`
);

i18n = i18n.replace(
  '"chassisDetails": "CHASSIS DETAILS",',
  `"chassisDetails": "CHASSIS DETAILS",
        "saveChanges": "Save Changes",`
);

i18n = i18n.replace(
  '"chassisDetails": "DETALLES DEL CHASIS",',
  `"chassisDetails": "DETALLES DEL CHASIS",
        "saveChanges": "Guardar Cambios",`
);

i18n = i18n.replace(
  '"status": "Status",',
  `"status": "Status",
        "statusPrefix": "State: ",
        "connectedVia": "Connected via ",
        "noTag": "No tag",
        "available": "Available",
        "route": "Route: ",`
);

i18n = i18n.replace(
  '"status": "Estado",',
  `"status": "Estado",
        "statusPrefix": "Estado: ",
        "connectedVia": "Conectado via ",
        "noTag": "Sin tag",
        "available": "Disponible",
        "route": "Ruta: ",`
);

i18n = i18n.replace(
  '"cancelEdit": "Cancel edit",',
  `"cancelEdit": "Cancel edit",
        "adjustCable": "Adjust Cable by Type:",
        "copperBlue": "Copper (Blue)",
        "fiberOrange": "Fiber (Orange)",
        "fiberPurple": "Fiber (Purple)",
        "powerYellow": "Power Line (Yellow)",
        "cableColor": "Cable Color",`
);

i18n = i18n.replace(
  '"cancelEdit": "Cancelar edición",',
  `"cancelEdit": "Cancelar edición",
        "adjustCable": "Ajustar Cable por Tipo:",
        "copperBlue": "Cobre (Azul)",
        "fiberOrange": "Fibra (Naranja)",
        "fiberPurple": "Fibra (Morado)",
        "powerYellow": "Power Line (Amarillo)",
        "cableColor": "Color del Cable",`
);

fs.writeFileSync('frontend/src/i18n.ts', i18n);


function replaceFile(path, ops) {
    let content = fs.readFileSync(path, 'utf8');
    for (let [search, replace] of ops) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content);
}

replaceFile('frontend/src/App.tsx', [
    [/Origen:/g, '{t("app.origin")}'],
    [/• Selecciona puerto destino\./g, '{t("app.selectDest")}'],
    [/>\s*Ver Todo\s*</g, '>{t("app.viewAll")}<']
]);

replaceFile('frontend/src/components/rackface/RackfaceGrid.tsx', [
    [/Estado: \$\{isConnected \? \`Conectado via \$\{conn\?\.cableType\} \(\$\{conn\?\.labelTag \|\| 'Sin tag'\}\)\` : 'Disponible'\}/g, '${t("rackface.statusPrefix")}${isConnected ? `${t("rackface.connectedVia")}${conn?.cableType} (${conn?.labelTag || t("rackface.noTag")})` : t("rackface.available")}'],
    [/\$\{isConnected \? \`Ruta: \$\{conn\?\.sourcePort/g, '${isConnected ? `${t("rackface.route")}${conn?.sourcePort'],
    [/<Save size=\{14\} \/> Guardar Cambios/g, '<Save size={14} /> {t("rackface.saveChanges")}'],
    [/>\s*Cancelar\s*<\/button>/g, '>{t("wirelist.cancel")}</button>']
]);

replaceFile('frontend/src/components/ui/ConnectionModal.tsx', [
    [/Ajustar Cable por Tipo:/g, '{t("connection.adjustCable")}'],
    [/'Cobre \(Azul\)'/g, 't("connection.copperBlue")'],
    [/'Fibra \(Naranja\)'/g, 't("connection.fiberOrange")'],
    [/'Fibra \(Morado\)'/g, 't("connection.fiberPurple")'],
    [/'Power Line \(Amarillo\)'/g, 't("connection.powerYellow")'],
    [/Color del Cable/g, '{t("connection.cableColor")}'],
    [/t\('connectionModal\.cancel'\)/g, 't("wirelist.cancel")']
]);

console.log('Fixed final final final strings!');
