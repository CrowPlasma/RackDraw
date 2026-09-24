const fs = require('fs');

function replaceFile(path, replacer) {
  let content = fs.readFileSync(path, 'utf8');
  content = replacer(content);
  fs.writeFileSync(path, content);
}

replaceFile('frontend/src/components/layout/Sidebar.tsx', c => {
  if (!c.includes('useTranslation')) {
    c = c.replace('import { useRackStore', 'import { useTranslation } from "react-i18next";\nimport { useRackStore');
    c = c.replace('export default function Sidebar() {', 'export default function Sidebar() {\n  const { t } = useTranslation();');
  }
  return c
    .replace(/>Gestión de Gabinetes</g, `>{t('sidebar.rackManagement')}<`)
    .replace(/>Racks Disponibles</g, `>{t('sidebar.availableRacks')}<`)
    .replace(/>Añadir Gabinete</g, `>{t('sidebar.addRack')}<`)
    .replace(/>Nombre del Rack</g, `>{t('sidebar.rackName')}<`)
    .replace(/>Altura \(U\)</g, `>{t('sidebar.heightU')}<`)
    .replace(/>Crear Gabinete</g, `>{t('sidebar.createRack')}<`)
    .replace(/>Cancelar</g, `>{t('sidebar.cancel')}<`)
    .replace(/>Eliminar Gabinete</g, `>{t('sidebar.deleteRack')}<`)
    .replace(/>¿Estás seguro de eliminar este rack\? Se perderán todos sus equipos y cables.</g, `>{t('sidebar.confirmDelete')}<`);
});

replaceFile('frontend/src/App.tsx', c => {
  if (!c.includes('const { t, i18n }')) {
    c = c.replace('const { i18n } = useTranslation();', 'const { t, i18n } = useTranslation();');
  }
  return c
    .replace(/>Docker Activo</g, `>{t('app.dockerActive')}<`)
    .replace(/> Exportar \(CSV\)/g, `> {t('app.exportCSV')}`)
    .replace(/> Generar Reporte/g, `> {t('app.generateReport')}`);
});

replaceFile('frontend/src/components/layout/WireListPanel.tsx', c => {
  if (!c.includes('useTranslation')) {
    c = c.replace('import { useRackStore', 'import { useTranslation } from "react-i18next";\nimport { useRackStore');
    c = c.replace('export default function WireListPanel() {', 'export default function WireListPanel() {\n  const { t } = useTranslation();');
  }
  return c
    .replace(/>Wirelist: Tabla de Conexiones</g, `>{t('wirelist.title')}<`)
    .replace(/placeholder="Buscar equipo, puerto o etiqueta..."/g, `placeholder={t('wirelist.search')}`)
    .replace(/>Origen</g, `>{t('wirelist.source')}<`)
    .replace(/>Destino</g, `>{t('wirelist.target')}<`)
    .replace(/>Tipo</g, `>{t('wirelist.type')}<`)
    .replace(/>Color</g, `>{t('wirelist.color')}<`)
    .replace(/>Longitud</g, `>{t('wirelist.length')}<`)
    .replace(/>Etiqueta</g, `>{t('wirelist.label')}<`)
    .replace(/>Acciones</g, `>{t('wirelist.actions')}<`)
    .replace(/>Añadir Conexión</g, `>{t('wirelist.addConnection')}<`)
    .replace(/>No hay conexiones en este rack\. Añade cableado para ver la lista\.</g, `>{t('wirelist.noConnections')}<`)
    .replace(/>m</g, `>{t('wirelist.meters')}<`);
});

replaceFile('frontend/src/components/ui/ConnectionModal.tsx', c => {
  if (!c.includes('useTranslation')) {
    c = c.replace('import { useRackStore', 'import { useTranslation } from "react-i18next";\nimport { useRackStore');
    c = c.replace('export default function ConnectionModal', 'export default function ConnectionModal'); // ensure export
    c = c.replace('const handleSave = () => {', 'const { t } = useTranslation();\n  const handleSave = () => {');
  }
  return c
    .replace(/>Crear Conexión de Cableado</g, `>{t('connectionModal.title')}<`)
    .replace(/>Equipo Origen</g, `>{t('connectionModal.sourceDev')}<`)
    .replace(/>Puerto Origen</g, `>{t('connectionModal.sourcePort')}<`)
    .replace(/>Equipo Destino</g, `>{t('connectionModal.targetDev')}<`)
    .replace(/>Puerto Destino</g, `>{t('connectionModal.targetPort')}<`)
    .replace(/>Medio Físico</g, `>{t('connectionModal.mediaType')}<`)
    .replace(/>Color de Cable</g, `>{t('connectionModal.cableColor')}<`)
    .replace(/>Longitud \(Metros\)</g, `>{t('connectionModal.length')}<`)
    .replace(/>Etiqueta \(Opcional\)</g, `>{t('connectionModal.labelTag')}<`)
    .replace(/>Guardar Conexión</g, `>{t('connectionModal.save')}<`)
    .replace(/>Cancelar</g, `>{t('connectionModal.cancel')}<`);
});

replaceFile('frontend/src/components/rackface/RackfaceGrid.tsx', c => {
  if (!c.includes('useTranslation')) {
    c = c.replace('import { useRackStore', 'import { useTranslation } from "react-i18next";\nimport { useRackStore');
    c = c.replace('export default function RackfaceGrid(', 'export default function RackfaceGrid('); 
    c = c.replace('const [dimmed, setDimmed] = useState', 'const { t } = useTranslation();\n  const [dimmed, setDimmed] = useState');
  }
  return c
    .replace(/>Detalles del Equipo</g, `>{t('rackface.deviceDetails')}<`)
    .replace(/>Marca</g, `>{t('rackface.brand')}<`)
    .replace(/>Modelo</g, `>{t('rackface.model')}<`)
    .replace(/S\/N:/g, `{t('rackface.sn')}:`)
    .replace(/>Puertos</g, `>{t('rackface.ports')}<`)
    .replace(/> Editar</g, `> {t('rackface.edit')}`)
    .replace(/> Clonar</g, `> {t('rackface.clone')}`)
    .replace(/> Eliminar</g, `> {t('rackface.delete')}`)
    .replace(/>Confirmar Eliminación</g, `>{t('rackface.confirmDeleteTitle')}<`)
    .replace(/> Confirmar Eliminación/g, `> {t('rackface.confirm')}`)
    .replace(/>¿Eliminar <strong style={{ color: 'var(--text-primary)' }}>\{deleteTargetDevice\.name\}<\/strong>\? Se eliminarán también todas sus conexiones de cableado\.</g, `>{t('rackface.confirmDeleteMsg').replace('{{name}}', deleteTargetDevice?.name || '')}<`)
    .replace(/>Montar Equipo</g, `>{t('rackface.addDevice')}<`)
    .replace(/>Editar Equipo</g, `>{t('rackface.editDevice')}<`)
    .replace(/>Nombre de Equipo</g, `>{t('rackface.devName')}<`)
    .replace(/>Color de Chasis</g, `>{t('rackface.color')}<`)
    .replace(/>Configuración Manual de Puertos</g, `>{t('rackface.portConfig')}<`)
    .replace(/>Cobre \(RJ45\)</g, `>{t('rackface.copper')}<`)
    .replace(/>Fibra \(SFP\/SFP\+\)</g, `>{t('rackface.sfp')}<`)
    .replace(/>Fibra \(GBIC\)</g, `>{t('rackface.gbic')}<`)
    .replace(/>Administración \(OOB\)</g, `>{t('rackface.mgmt')}<`)
    .replace(/>Fuente de Poder \(PSU\)</g, `>{t('rackface.power')}<`)
    .replace(/>Guardar Equipo</g, `>{t('rackface.save')}<`)
    .replace(/>Cancelar</g, `>{t('rackface.cancel')}<`);
});
