const fs = require('fs');

const path = 'frontend/src/components/layout/Sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replacements
content = content.replace('Proyecto Activo', '{t("sidebar.activeProject")}');
content = content.replace('> Editar Proyecto', '> {t("sidebar.editProject")}');
content = content.replace('> Borrar', '> {t("sidebar.deleteProject")}');
content = content.replace('Racks / Gabinetes', '{t("sidebar.racks")}');
content = content.replace('Selecciona un proyecto para listar racks', '{t("sidebar.noRacks")}');
content = content.replace('Sin racks en este proyecto. ¡Crea uno!', '{t("sidebar.noRacks")}');
content = content.replace('> Añadir Gabinete', '> {t("sidebar.addRackBtn")}');
content = content.replace('>Crear Nuevo Rack / Gabinete<', '>{t("sidebar.createRack")}<');
content = content.replace('>Nombre del Rack<', '>{t("sidebar.rackName")}<');
content = content.replace('Altura (U)', '{t("sidebar.heightU")}');
content = content.replace(/>Cancelar<\/button>/g, '>{t("sidebar.cancel")}</button>');
content = content.replace(/>Crear Rack<\/button>/g, '>{t("sidebar.createRack")}</button>');
content = content.replace('>Crear Nuevo Proyecto<', '>{t("sidebar.newProject")}<');
content = content.replace('>Nombre del Proyecto<', '>{t("sidebar.projectName")}<');
content = content.replace('>Descripción (Opcional)<', '>{t("sidebar.projectDesc")}<');
content = content.replace(/>Crear<\/button>/g, '>{t("sidebar.create")}</button>');
content = content.replace('placeholder="Buscar proyecto..."', 'placeholder={t("sidebar.searchProject")}');
content = content.replace('>Borrar Proyecto<', '>{t("sidebar.deleteProject")}<');
content = content.replace('>Editar Proyecto<', '>{t("sidebar.editProject")}<');
content = content.replace('>Editar Proyecto</h3>', '>{t("sidebar.editProject")}</h3>'); // Modal title
content = content.replace('¿Eliminar el Proyecto?', '{t("sidebar.deleteProjectConfirm")}');

// Complex JSX replacements for project deletion
const projRegex = /¿Estás seguro de eliminar el proyecto <strong.*?>\{deleteProjectTarget\.name\}<\/strong>\? Se eliminarán permanentemente todos sus racks, equipos y cables\./;
content = content.replace(projRegex, '{t("sidebar.deleteProjectMsg")} <strong style={{ color: \'var(--text-primary)\' }}>{deleteProjectTarget.name}</strong>');

// Complex JSX replacements for rack deletion
const rackRegex = /¿Estás seguro de eliminar el rack <strong.*?>\{deleteRackTarget\.name\}<\/strong>\? Se eliminarán todos los equipos montados y sus conexiones\./;
content = content.replace(rackRegex, '{t("sidebar.confirmDelete")} <strong style={{ color: \'var(--text-primary)\' }}>{deleteRackTarget.name}</strong>');

fs.writeFileSync(path, content);

// WireListPanel placeholder fix
let wirelistPath = 'frontend/src/components/layout/WireListPanel.tsx';
let wirelistContent = fs.readFileSync(wirelistPath, 'utf8');
wirelistContent = wirelistContent.replace('placeholder="🔍 Buscar por equipo, puerto o etiqueta..."', 'placeholder={`🔍 ${t("wirelist.search")}`}');
fs.writeFileSync(wirelistPath, wirelistContent);

console.log('Fixed sidebar completely.');
