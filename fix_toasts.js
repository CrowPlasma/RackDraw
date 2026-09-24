const fs = require('fs');

let i18n = fs.readFileSync('frontend/src/i18n.ts', 'utf8');

// Add toast keys for English
i18n = i18n.replace(
  '"dockerActive": "Docker Active",',
  `"dockerActive": "Docker Active",
        "toast": {
            "noSpaceToClone": "Not enough space in the rack to clone this device.",
            "deviceCloned": "Device successfully cloned in U",
            "deviceUpdated": "Device successfully updated.",
            "noCablesToExport": "No cables to export in this rack.",
            "projectCreated": "Project created successfully.",
            "projectUpdated": "Project updated.",
            "projectDeleted": "Project deleted.",
            "rackCreated": "Rack created successfully.",
            "rackUpdated": "Rack updated.",
            "rackDeleted": "Rack deleted.",
            "deviceMounted": "Device mounted in rack.",
            "deviceRemoved": "Device removed successfully.",
            "portAdded": "Port added successfully.",
            "portRemoved": "Port removed successfully.",
            "cableInstalled": "Cable installed successfully.",
            "cableModified": "Cable modified successfully.",
            "cableDisconnected": "Cable disconnected and removed."
        },`
);

// Add toast keys for Spanish
i18n = i18n.replace(
  '"dockerActive": "Docker Activo",',
  `"dockerActive": "Docker Activo",
        "toast": {
            "noSpaceToClone": "No hay espacio suficiente en el Rack para clonar este equipo.",
            "deviceCloned": "Equipo clonado exitosamente en U",
            "deviceUpdated": "Equipo actualizado correctamente.",
            "noCablesToExport": "No hay cables para exportar en este rack.",
            "projectCreated": "Proyecto creado exitosamente.",
            "projectUpdated": "Proyecto actualizado.",
            "projectDeleted": "Proyecto eliminado.",
            "rackCreated": "Rack creado exitosamente.",
            "rackUpdated": "Rack actualizado.",
            "rackDeleted": "Rack eliminado.",
            "deviceMounted": "Equipo montado en el rack.",
            "deviceRemoved": "Equipo retirado correctamente.",
            "portAdded": "Puerto agregado correctamente.",
            "portRemoved": "Puerto eliminado correctamente.",
            "cableInstalled": "Cable instalado con éxito.",
            "cableModified": "Cable modificado con éxito.",
            "cableDisconnected": "Cable desconectado y retirado."
        },`
);

fs.writeFileSync('frontend/src/i18n.ts', i18n);

function replaceFile(path, ops) {
    let content = fs.readFileSync(path, 'utf8');
    for (let [search, replace] of ops) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content);
}

replaceFile('frontend/src/components/rackface/RackfaceGrid.tsx', [
    [/"No hay espacio suficiente en el Rack para clonar este equipo\."/g, 't("toast.noSpaceToClone")'],
    [/\`Equipo clonado exitosamente en U\$\{targetU\}\.\`/g, '`${t("toast.deviceCloned")}${targetU}.`'],
    [/'Equipo actualizado correctamente\.'/g, 't("toast.deviceUpdated")']
]);

replaceFile('frontend/src/App.tsx', [
    [/'No hay cables para exportar en este rack\.'/g, 't("toast.noCablesToExport")']
]);

let storePath = 'frontend/src/store/useRackStore.ts';
let storeContent = fs.readFileSync(storePath, 'utf8');

if (!storeContent.includes("import i18n from '../i18n';")) {
    storeContent = storeContent.replace(
        "import { create } from 'zustand';",
        "import { create } from 'zustand';\nimport i18n from '../i18n';"
    );
}

storeContent = storeContent.replace(/'Proyecto creado exitosamente\.'/g, 'i18n.t("toast.projectCreated")');
storeContent = storeContent.replace(/'Proyecto actualizado\.'/g, 'i18n.t("toast.projectUpdated")');
storeContent = storeContent.replace(/'Proyecto eliminado\.'/g, 'i18n.t("toast.projectDeleted")');
storeContent = storeContent.replace(/'Rack creado exitosamente\.'/g, 'i18n.t("toast.rackCreated")');
storeContent = storeContent.replace(/'Rack actualizado\.'/g, 'i18n.t("toast.rackUpdated")');
storeContent = storeContent.replace(/'Rack eliminado\.'/g, 'i18n.t("toast.rackDeleted")');
storeContent = storeContent.replace(/'Equipo montado en el rack\.'/g, 'i18n.t("toast.deviceMounted")');
storeContent = storeContent.replace(/'Equipo retirado correctamente\.'/g, 'i18n.t("toast.deviceRemoved")');
storeContent = storeContent.replace(/'Dispositivo actualizado\.'/g, 'i18n.t("toast.deviceUpdated")');
storeContent = storeContent.replace(/'Puerto agregado correctamente\.'/g, 'i18n.t("toast.portAdded")');
storeContent = storeContent.replace(/'Puerto eliminado correctamente\.'/g, 'i18n.t("toast.portRemoved")');
storeContent = storeContent.replace(/'Cable installed successfully\.'/g, 'i18n.t("toast.cableInstalled")');
storeContent = storeContent.replace(/'Cable modified successfully\.'/g, 'i18n.t("toast.cableModified")');
storeContent = storeContent.replace(/'Cable desconectado y retirado\.'/g, 'i18n.t("toast.cableDisconnected")');

fs.writeFileSync(storePath, storeContent);

console.log('Fixed toasts!');
