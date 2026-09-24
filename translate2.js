const fs = require('fs');

function replaceFile(path, replacer) {
  let content = fs.readFileSync(path, 'utf8');
  content = replacer(content);
  fs.writeFileSync(path, content);
}

// Sidebar.tsx
replaceFile('frontend/src/components/layout/Sidebar.tsx', c => {
  return c
    .replace(/>PROYECTO ACTIVO</g, `>{t('sidebar.activeProject')}<`)
    .replace(/> Editar Proyecto</g, `> {t('sidebar.editProject')}`)
    .replace(/> Borrar</g, `> {t('sidebar.deleteProject')}`)
    .replace(/>RACKS \/ GABINETES</g, `>{t('sidebar.racks')}<`)
    .replace(/Crear Nuevo Rack \/ Gabinete/g, `{t('sidebar.createRack')}`)
    .replace(/Rack Name/g, `{t('sidebar.rackName')}`)
    .replace(/Altura en Unidades \(U\)/g, `{t('sidebar.heightU')}`)
    .replace(/>Cancel</g, `>{t('sidebar.cancel')}<`)
    .replace(/>Crear Rack</g, `>{t('sidebar.createRack')}<`)
    .replace(/>Crear Nuevo Proyecto</g, `>{t('sidebar.newProject')}<`)
    .replace(/Nombre del Proyecto/g, `{t('sidebar.projectName')}`)
    .replace(/Descripción \(Opcional\)/g, `{t('sidebar.projectDesc')}`)
    .replace(/>Crear</g, `>{t('sidebar.create')}<`)
    .replace(/placeholder="Buscar proyecto..."/gi, `placeholder={t('sidebar.searchProject')}`)
    .replace(/>No hay racks en este proyecto\.</g, `>{t('sidebar.noRacks')}<`)
    .replace(/>¿Eliminar Proyecto\?</g, `>{t('sidebar.deleteProjectConfirm')}<`)
    .replace(/>¿Estás seguro de eliminar este proyecto y todos sus racks\?</g, `>{t('sidebar.deleteProjectMsg')}<`);
});

// WireListPanel.tsx
replaceFile('frontend/src/components/layout/WireListPanel.tsx', c => {
  return c
    .replace(/Inspector de Dispositivo/g, `{t('wirelist.inspector')}`)
    .replace(/>Cerrar</g, `>{t('wirelist.close')}<`)
    .replace(/CABLES DE /g, `{t('wirelist.cablesOf')} `)
    .replace(/placeholder="Buscar por equipo, puerto o etiqueta..."/g, `placeholder={t('wirelist.search')}`)
    .replace(/>Desde:</g, `>{t('wirelist.from')}<`)
    .replace(/>Hacia:</g, `>{t('wirelist.to')}<`);
});

// RackfaceGrid.tsx
replaceFile('frontend/src/components/rackface/RackfaceGrid.tsx', c => {
  return c
    .replace(/>Editar Equipo \/ Puertos</g, `>{t('rackface.editEquipPorts')}<`)
    .replace(/>Ubicación U:</g, `>{t('rackface.locationU')}<`)
    .replace(/Slot /g, `{t('rackface.slot')} `)
    .replace(/>DETALLES DEL CHASIS</g, `>{t('rackface.chassisDetails')}<`)
    .replace(/>INTERFACES DE RED/g, `>{t('rackface.netInterfaces')}<`)
    .replace(/>Slot Posición \(U\)</g, `>{t('rackface.slotPos')}<`)
    .replace(/>Altura \(U\)</g, `>{t('rackface.heightU')}<`)
    .replace(/>Color de Tarjeta \(Lateral\)</g, `>{t('rackface.color')}<`)
    .replace(/>Guardar Chasis</g, `>{t('rackface.save')}<`)
    .replace(/>Agregar Nueva Interfaz:</g, `>{t('rackface.addNewInterface')}<`)
    .replace(/Nombre \(ej\. Gi1\/0\/2\)/g, `{t('rackface.nameEj')}`)
    .replace(/>\+ Agregar Puerto</g, `>{t('rackface.addPort')}<`)
    .replace(/>Configuración de hardware e interfaces</g, `>{t('rackface.hardwareConfig')}<`)
    .replace(/>Modificar datos del chasis</g, `>{t('rackface.modifyChassis')}<`)
    .replace(/>RJ45 \(Cobre\)</g, `>{t('rackface.copper')}<`)
    .replace(/>Fibra SFP</g, `>{t('rackface.sfp')}<`)
    .replace(/>Fibra GBIC</g, `>{t('rackface.gbic')}<`)
    .replace(/>Gestión \(Management\)</g, `>{t('rackface.mgmt')}<`)
    .replace(/>Alimentación \(Power\)</g, `>{t('rackface.power')}<`)
    .replace(/>Cancelar</g, `>{t('rackface.cancel')}<`)
    .replace(/>Guardar Cambios</g, `>{t('rackface.save')}<`)
    .replace(/>Marca \/ Fabricante</g, `>{t('rackface.brand')}<`)
    .replace(/>Modelo</g, `>{t('rackface.model')}<`)
    .replace(/>Número de Serie</g, `>{t('rackface.sn')}<`);
});
