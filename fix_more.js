const fs = require('fs');

function replaceFile(path, ops) {
  let c = fs.readFileSync(path, 'utf8');
  for (let [search, replace] of ops) {
    c = c.replace(search, replace);
  }
  fs.writeFileSync(path, c);
}

replaceFile('frontend/src/components/layout/WireListPanel.tsx', [
  ['⚙️ Puerto Seleccionado', '⚙️ {t("wirelist.selectedPort")}'],
  ['Puerto: ', '{t("wirelist.port")}: '],
  ['Tipo: ', '{t("wirelist.type")}: '],
  [' • Velocidad: ', ' • {t("wirelist.speed")}: '],
  ['Interfaz no asignada', '{t("wirelist.unassignedInterface")}'],
  ['Este puerto de red no está conectado a ningún cable en este rack.', '{t("wirelist.unassignedDesc")}'],
  ['Iniciar Cableado desde Aquí', '{t("wirelist.startCabling")}'],
  ['Equipo Origen', '{t("connection.sourceDev")}'],
  ['Puerto Origen', '{t("connection.sourcePort")}'],
  ['Equipo Destino', '{t("connection.targetDev")}'],
  ['Puerto Destino', '{t("connection.targetPort")}'],
  ["'Detalle de Enlace'", "t('wirelist.linkDetail')"]
]);

replaceFile('frontend/src/components/rackface/RackfaceGrid.tsx', [
  ['Mod: ', '{t("rackface.mod")}: '],
  ['S/N: ', '{t("rackface.sn")}: '], // might need to check if S/N is already there
  ['>Editar<', '>{t("rackface.edit")}<'],
  ['> Clonar<', '> {t("rackface.clone")}<'],
  ['title="Clonar equipo en siguiente espacio disponible"', 'title={t("rackface.cloneTooltip")}']
]);

// Inject t() into App.tsx for the export CSV
let appContent = fs.readFileSync('frontend/src/App.tsx', 'utf8');
appContent = appContent.replace(
  "const headers = ['Etiqueta', 'Equipo Origen', 'Puerto Origen', 'Equipo Destino', 'Puerto Destino', 'Tipo de Cable', 'Color', 'Longitud (Metros)'];",
  "const headers = [t('wirelist.tag'), t('connection.sourceDev'), t('connection.sourcePort'), t('connection.targetDev'), t('connection.targetPort'), t('connection.cableType'), t('wirelist.color'), t('connection.length')];"
);
appContent = appContent.replace("Mod: ", "{t('rackface.mod')}: ");
appContent = appContent.replace("S/N: ", "{t('rackface.sn')}: ");
fs.writeFileSync('frontend/src/App.tsx', appContent);

console.log('Fixed more translations');
