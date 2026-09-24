const fs = require('fs');

function applyRegexFixes(path, fixes) {
    let content = fs.readFileSync(path, 'utf8');
    for (let [search, replace] of fixes) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content);
}

applyRegexFixes('frontend/src/components/layout/WireListPanel.tsx', [
    [/return 'Energía';/g, "return t('wirelist.power');"],
    [/⚙️ Editar Conexión de Red/g, '⚙️ {t("wirelist.editConnection")}'],
    [/<option value="POWER">Energía<\/option>/g, '<option value="POWER">{t("wirelist.power")}</option>'],
    [/Sin resultados para esa búsqueda\./g, '{t("wirelist.noResults")}'],
    [/No hay cables instalados\./g, '{t("wirelist.noCables")}'],
    [/Cancelar edición/g, '{t("wirelist.cancelEdit")}'],
    [/Editar cable/g, '{t("wirelist.editCable")}'],
    [/Configuración de hardware e interfaces/g, '{t("rackface.hardwareConfig")}'],
    [/Número de Serie/g, '{t("rackface.sn")}'],
    [/Slot Posición \(U\)/g, '{t("rackface.slotPos")}'],
    [/Se eliminarán también todas sus conexiones de cableado\./g, '{t("rackface.confirmDeleteSub")}'],
    [/>Color</g, '>{t("wirelist.color")}<'], // from previous miss
    [/>Etiqueta</g, '>{t("wirelist.tag")}<'], // from previous miss
    [/>Longitud \(m\)</g, '>{t("wirelist.lengthM")}<'] // from previous miss
]);

applyRegexFixes('frontend/src/components/rackface/RackfaceGrid.tsx', [
    [/\$\{port\.name\} \(\$\{isFiber \? 'Fibra' : port\.type === 'POWER' \? 'Energía' : 'Cobre'\}\)/g, '${port.name} (${isFiber ? t("wirelist.fiber") : port.type === "POWER" ? t("wirelist.power") : t("wirelist.copper")})'],
    [/Soltar aquí para mover/g, '{t("rackface.dropToMove")}'],
    [/Montar en U/g, '{t("rackface.mountInU")}'],
    [/Tamaño \(Unidades U\)/g, '{t("rackface.sizeU")}'],
    [/Configuración Manual de Puertos \/ Interfaces/g, '{t("rackface.portConfig")}'],
    [/Número de Serie/g, '{t("rackface.sn")}'],
    [/Gestión \(Management\)/g, '{t("rackface.mgmt")}'],
    [/Alimentación \(Power\)/g, '{t("rackface.power")}'],
    [/Confirmar Eliminación/g, '{t("rackface.confirm")}'],
    [/Esta acción no se puede deshacer/g, '{t("wirelist.cannotUndo")}'],
    [/¿Eliminar /g, '{t("rackface.confirmDeleteQ")} '],
    [/\? Se eliminarán también todas sus conexiones de cableado\./g, ' {t("rackface.confirmDeleteSub")}'],
    [/>Editar Equipo</g, '>{t("rackface.editDevice")}<'],
    [/>Modificar datos del chasis</g, '>{t("rackface.modifyChassis")}<'],
    [/>Marca \/ Fabricante</g, '>{t("rackface.brand")}<'],
    [/>Modelo</g, '>{t("rackface.model")}<'],
    [/>Nombre de Equipo</g, '>{t("rackface.devName")}<'],
    [/>Color de Tarjeta \(Lateral\)</g, '>{t("rackface.color")}<'],
    [/>DETALLES DEL CHASIS</g, '>{t("rackface.chassisDetails")}<'],
    [/>INTERFACES DE RED</g, '>{t("rackface.netInterfaces")}<'],
    [/>Altura \(U\)</g, '>{t("rackface.heightU")}<'],
    [/>Agregar Nueva Interfaz:</g, '>{t("rackface.addNewInterface")}<'],
    [/>\+ Agregar Puerto</g, '>{t("rackface.addPort")}<'],
    [/>RJ45 \(Cobre\)</g, '>{t("rackface.copper")}<'],
    [/>Fibra SFP</g, '>{t("rackface.sfp")}<'],
    [/>Fibra GBIC</g, '>{t("rackface.gbic")}<'],
    [/>Guardar Chasis</g, '>{t("rackface.save")}<']
]);

let i18n = fs.readFileSync('frontend/src/i18n.ts', 'utf8');

i18n = i18n.replace(
  '"startCabling": "Start Cabling from Here"',
  '"startCabling": "Start Cabling from Here",\n        "power": "Power",\n        "copper": "Copper",\n        "fiber": "Fiber",\n        "editConnection": "Edit Network Connection",\n        "noResults": "No results for that search.",\n        "noCables": "No cables installed.",\n        "cancelEdit": "Cancel edit",\n        "editCable": "Edit cable"'
);

i18n = i18n.replace(
  '"startCabling": "Iniciar Cableado desde Aquí"',
  '"startCabling": "Iniciar Cableado desde Aquí",\n        "power": "Energía",\n        "copper": "Cobre",\n        "fiber": "Fibra",\n        "editConnection": "Editar Conexión de Red",\n        "noResults": "Sin resultados para esa búsqueda.",\n        "noCables": "No hay cables instalados.",\n        "cancelEdit": "Cancelar edición",\n        "editCable": "Editar cable"'
);

i18n = i18n.replace(
  '"cloneTooltip": "Clone device in next available space"',
  '"cloneTooltip": "Clone device in next available space",\n        "dropToMove": "Drop here to move",\n        "mountInU": "Mount in U",\n        "sizeU": "Size (U Units)",\n        "confirmDeleteQ": "Delete",\n        "confirmDeleteSub": "? All its cable connections will also be removed."'
);

i18n = i18n.replace(
  '"cloneTooltip": "Clonar equipo en siguiente espacio disponible"',
  '"cloneTooltip": "Clonar equipo en siguiente espacio disponible",\n        "dropToMove": "Soltar aquí para mover",\n        "mountInU": "Montar en U",\n        "sizeU": "Tamaño (Unidades U)",\n        "confirmDeleteQ": "¿Eliminar",\n        "confirmDeleteSub": "? Se eliminarán también todas sus conexiones de cableado."'
);

fs.writeFileSync('frontend/src/i18n.ts', i18n);
console.log('Fixed ALL remaining Spanish edge cases');
