const fs = require('fs');

function applyTo(path, operations) {
  let c = fs.readFileSync(path, 'utf8');
  for (let op of operations) {
    c = c.replace(op[0], op[1]);
  }
  fs.writeFileSync(path, c);
}

applyTo('frontend/src/components/layout/Sidebar.tsx', [
  ['import { useRackStore }', 'import { useTranslation } from "react-i18next";\nimport { useRackStore }'],
  ['export default function Sidebar() {', 'export default function Sidebar() {\n  const { t } = useTranslation();'],
  ['>PROYECTO ACTIVO<', '>{t("sidebar.activeProject")}<'],
  ['> Editar Proyecto<', '> {t("sidebar.editProject")}<'],
  ['> Borrar<', '> {t("sidebar.deleteProject")}<'],
  ['>RACKS / GABINETES<', '>{t("sidebar.racks")}<'],
  ['> Añadir Gabinete<', '> {t("sidebar.addRackBtn")}<'],
  ['>Crear Nuevo Rack / Gabinete<', '>{t("sidebar.createRack")}<'],
  ['>Rack Name<', '>{t("sidebar.rackName")}<'],
  ['>Altura en Unidades (U)<', '>{t("sidebar.heightU")}<'],
  ['>Cancel<', '>{t("sidebar.cancel")}<'],
  ['>Crear Rack<', '>{t("sidebar.createRack")}<'],
  ['>Crear Nuevo Proyecto<', '>{t("sidebar.newProject")}<'],
  ['>Nombre del Proyecto<', '>{t("sidebar.projectName")}<'],
  ['>Descripción (Opcional)<', '>{t("sidebar.projectDesc")}<'],
  ['>Crear<', '>{t("sidebar.create")}<'],
  ['placeholder="Buscar proyecto..."', 'placeholder={t("sidebar.searchProject")}'],
  ['>No hay racks en este proyecto.<', '>{t("sidebar.noRacks")}<'],
  ['>¿Eliminar Proyecto?<', '>{t("sidebar.deleteProjectConfirm")}<'],
  ['>¿Estás seguro de eliminar este proyecto y todos sus racks?<', '>{t("sidebar.deleteProjectMsg")}<']
]);

applyTo('frontend/src/components/layout/WireListPanel.tsx', [
  ['import { useRackStore', 'import { useTranslation } from "react-i18next";\nimport { useRackStore'],
  ['}: WireListPanelProps) {', '}: WireListPanelProps) {\n  const { t } = useTranslation();'],
  ['>Inspector de Dispositivo<', '>{t("wirelist.inspector")}<'],
  ['>Cerrar<', '>{t("wirelist.close")}<'],
  ['CABLES DE ', '{t("wirelist.cablesOf")} '],
  ['placeholder="Buscar por equipo, puerto o etiqueta..."', 'placeholder={t("wirelist.search")}'],
  ['>Desde:<', '>{t("wirelist.from")}<'],
  ['>Hacia:<', '>{t("wirelist.to")}<']
]);

applyTo('frontend/src/components/rackface/RackfaceGrid.tsx', [
  ['import { useRackStore', 'import { useTranslation } from "react-i18next";\nimport { useRackStore'],
  ['isPrintCopy = false }: RackfaceGridProps) {', 'isPrintCopy = false }: RackfaceGridProps) {\n  const { t } = useTranslation();'],
  ['>Editar Equipo / Puertos<', '>{t("rackface.editEquipPorts")}<'],
  ['>Ubicación U:<', '>{t("rackface.locationU")}<'],
  ['Slot ', '{t("rackface.slot")} '],
  ['>DETALLES DEL CHASIS<', '>{t("rackface.chassisDetails")}<'],
  ['>INTERFACES DE RED<', '>{t("rackface.netInterfaces")}<'],
  ['>Slot Posición (U)<', '>{t("rackface.slotPos")}<'],
  ['>Altura (U)<', '>{t("rackface.heightU")}<'],
  ['>Color de Tarjeta (Lateral)<', '>{t("rackface.color")}<'],
  ['>Guardar Chasis<', '>{t("rackface.save")}<'],
  ['>Agregar Nueva Interfaz:<', '>{t("rackface.addNewInterface")}<'],
  ['Nombre (ej. Gi1/0/2)', '{t("rackface.nameEj")}'],
  ['>+ Agregar Puerto<', '>{t("rackface.addPort")}<'],
  ['>Configuración de hardware e interfaces<', '>{t("rackface.hardwareConfig")}<'],
  ['>Modificar datos del chasis<', '>{t("rackface.modifyChassis")}<'],
  ['>RJ45 (Cobre)<', '>{t("rackface.copper")}<'],
  ['>Fibra SFP<', '>{t("rackface.sfp")}<'],
  ['>Fibra GBIC<', '>{t("rackface.gbic")}<'],
  ['>Gestión (Management)<', '>{t("rackface.mgmt")}<'],
  ['>Alimentación (Power)<', '>{t("rackface.power")}<'],
  ['>Cancelar<', '>{t("rackface.cancel")}<'],
  ['>Guardar Cambios<', '>{t("rackface.save")}<'],
  ['>Marca / Fabricante<', '>{t("rackface.brand")}<'],
  ['>Modelo<', '>{t("rackface.model")}<'],
  ['>Número de Serie<', '>{t("rackface.sn")}<'],
  ['>Nombre de Equipo<', '>{t("rackface.devName")}<'],
  ['>Configuración Manual de Puertos / Interfaces<', '>{t("rackface.portConfig")}<']
]);
